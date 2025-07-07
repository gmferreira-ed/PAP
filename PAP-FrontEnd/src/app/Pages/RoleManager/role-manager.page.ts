import { Component, inject } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { EndpointCategory, EndpointData, PermissionInfo, UserRole } from '../../../shared/permissions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PermissionsService } from '../../Services/Permissions.Service';
import { AuthService } from '../../Services/Auth.service';
import { IconsModule } from '../../Components/icon/icon.component';
import { NoDataComponent } from '../../Components/no-data/no-data';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingScreen } from '../../Components/loading-screen/loading-screen.component';
import { UserCard } from "../../Components/user-card/user-card";
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'stocks-page',
  imports: [PageLayoutComponent, NzDividerModule, NzSwitchModule, NzToolTipModule, FormsModule, IconsModule, NoDataComponent,
    TranslateModule, NzModalModule, NzButtonModule, NzIconModule, NzFormModule, ReactiveFormsModule, NzInputModule, NzSelectModule,
    LoadingScreen, UserCard],
  templateUrl: './role-manager.page.html',
  styleUrl: './role-manager.page.less'
})
export class RoleManagementPage {

  RolePermissionsURL = AppSettings.APIUrl + 'role-permissions'

  SelectedRole: UserRole = { name: 'Loading', administrator: false, permission_level: 1 }
  // DATA
  Roles: UserRole[] = []
  RoleUsers: any[] = []
  CategorizedPermissions: EndpointCategory[] = []
  EndpointPermissions: { [key: string]: any } = []

  // SERVICES
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)
  PermissionsService = inject(PermissionsService)
  ModalService = inject(NzModalService)
  AuthService = inject(AuthService)
  TranslateService = inject(TranslateService)

  // VARIABLES
  CanModify = this.AuthService.PagePermissions.CanModify
  CanCreateRoles = this.AuthService.HasEndpointPermission('roles', 'POST')

  // STATES
  LoadingRoles = true
  LoadingUsers = true
  LoadingPermissions = true
  RoleCreationModalVisible = false
  CreatingRole = false

  async LoadPermissions() {
    this.LoadingPermissions = true

    const [EndpointPermissions] =
      await this.HttpService.MakeRequest(AppSettings.APIUrl + 'role-permissions', 'GET', this.TranslateService.instant('Failed to fetch role permissions')) as [any[]]


    // Convert the backend data to have the required values
    const ConvertedResult: { [key: string]: EndpointData } = {}

    for (const EndpointData of Object.values(EndpointPermissions)) {
      if (!EndpointData.Unprotected && !EndpointData.Root && !EndpointData.Connected) {
        let ConvertedEndpointData: EndpointData = ConvertedResult[EndpointData.DisplayName]


        if (!ConvertedEndpointData) {
          ConvertedEndpointData = {
            ID: EndpointData.ID,
            DisplayName: EndpointData.DisplayName,
            Category: EndpointData.Category,
            Summary: EndpointData.Summary,
            PermissionLevels: EndpointData.Permissions
          }
          ConvertedResult[EndpointData.DisplayName] = ConvertedEndpointData
        }
      }
    }

    // Sort display names by manual configuration
    const FinalResult = Object.values(ConvertedResult)

    // Build a categorized result for the HTML
    const CategorizedResult: EndpointCategory[] = []
    for (const EndpointData of FinalResult) {
      let CategoryArray: EndpointCategory | undefined = CategorizedResult.find((Val) => { return Val.Category == EndpointData.Category })

      if (!CategoryArray) {
        CategoryArray = {
          Category: EndpointData.Category,
          Endpoints: []
        }
        CategorizedResult.push(CategoryArray)
      }

      CategoryArray.Endpoints.push(EndpointData)
    }


    // Sort categories
    CategorizedResult.sort((a, b) => {
      if (a.Category === 'General') return 1;
      if (b.Category === 'General') return -1;
      return 0;
    });


    this.CategorizedPermissions = CategorizedResult
    this.EndpointPermissions = EndpointPermissions
    console.log(EndpointPermissions)

    this.LoadingPermissions = false
  }

  async PermissionSwitchTriggered(EndpointData: EndpointData, Enabled: Boolean) {
    if (Enabled)
      this.AddEndpointPermissions(EndpointData)
    else
      this.RemoveEndpointPermissions(EndpointData)

  }

  //DELETE/UNLINK PERMISSIONS
  async RemoveEndpointPermissions(EndpointData: EndpointData) {

    EndpointData.Changing = true

    const [DeleteSuccess] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'role-permissions', 'DELETE', this.TranslateService.instant('Failed to remove permissions for') + ` ${this.SelectedRole}`,
      {
        endpoint_id: EndpointData.ID,
        role: this.SelectedRole.name
      }
    )

    EndpointData.Changing = false

    if (DeleteSuccess) {
      this.MessageService.success(this.TranslateService.instant('Sucessfully removed permissions'))
      this.LoadPermissions()
    }
  }


  //ADD ENDPOINT PERMISSIONS
  async AddEndpointPermissions(EndpointData: EndpointData) {

    EndpointData.Changing = true

    const [InsertSuccess] = await this.HttpService.MakeRequest(this.RolePermissionsURL, 'POST', this.TranslateService.instant('Failed to add endpoint permissions'),
      {
        endpoint_id: EndpointData.ID,
        role: this.SelectedRole.name
      }
    )

    EndpointData.Changing = false

    if (InsertSuccess) {
      this.MessageService.success(this.TranslateService.instant('Successfully added endpoint permissions!'))
      this.LoadPermissions()
    }
  }


  RoleCreateFrom = new FormGroup({
    name: new FormControl('', [Validators.required]),
    permission_level: new FormControl('', [Validators.required])
  })

  // ROLE MOD
  PromptDeleteRole(Role: UserRole, Event: MouseEvent) {
    Event.stopPropagation()

    this.ModalService.confirm({
      nzTitle: 'Confirm Action',
      nzContent: 'This may cause instability and remove multiple users from their respective permissions. Are you sure?',
      nzCentered: true,

      nzOnOk: async () => {
        const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'roles', 'DELETE', this.TranslateService.instant('Failed to delete role'), {
          name: Role.name,
        })

        if (Result) {
          this.MessageService.success(this.TranslateService.instant('Successfully deleteted role'))
          this.LoadRoles().then(() => {
            this.LoadRoleUsers()
          })
        }
      }
    })
  }

  async CreateRole() {
    this.CreatingRole = true
    this.RoleCreateFrom.disable()


    const FormVal = this.RoleCreateFrom.value
    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'roles', 'POST', this.TranslateService.instant('Failed to create role'), {
      name: FormVal.name,
      permission_level: FormVal.permission_level
    })

    if (Result) {
      this.MessageService.success(this.TranslateService.instant('Sucessfully created role'))
      this.RoleCreationModalVisible = false
      this.RoleCreateFrom.reset()

      await this.LoadRoles()
      this.LoadRoleUsers()
    }

    this.RoleCreateFrom.enable()
    this.CreatingRole = false
  }


  // Loading
  async LoadRoleUsers() {
    this.LoadingUsers = true

    this.RoleUsers = []
    const [RoleUsers] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'role-users', 'GET', this.TranslateService.instant('Failed to load role users'), {
      role: this.SelectedRole.name
    })
    if (RoleUsers) {
      this.RoleUsers = RoleUsers.Rows
    }

    this.LoadingUsers = false
  }

  async ChangeRole(NewRole: UserRole) {
    this.SelectedRole = NewRole
    await this.LoadRoleUsers()
  }

  async LoadRoles() {
    this.LoadingRoles = true

    const Roles = await this.PermissionsService.LoadRoles()
    if (Roles) {
      this.Roles = Roles.reverse()
      await this.ChangeRole(Roles[0])
    }

    this.LoadingRoles = false
  }

  async ngOnInit() {
    this.LoadRoles()
    this.LoadPermissions()
  }
}
