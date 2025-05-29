import { Component, inject } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { HttpService } from '../../Services/Http.service';
import { AppSettings } from '../../Services/AppSettings';
import { EndpointCategory, EndpointData, PermissionInfo } from '../../../../../shared/permissions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PermissionsService } from '../../Services/Permissions.Service';
import { AuthService } from '../../Services/Auth.service';
import { IconsModule } from '../../Components/icon/icon.component';
import { NoDataComponent } from '../../Components/no-data/no-data';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingScreen } from '../../Components/loading-screen/loading-screen.component';
import { UserCard } from "../../Components/user-card/user-card";

@Component({
  selector: 'stocks-page',
  imports: [PageLayoutComponent, NzDividerModule, NzSwitchModule, NzToolTipModule, FormsModule, IconsModule, NoDataComponent, TranslateModule,
    LoadingScreen, UserCard],
  templateUrl: './role-manager.page.html',
  styleUrl: './role-manager.page.less'
})
export class RoleManagementPage {

  RolePermissionsURL = AppSettings.APIUrl + 'role-permissions'

  SelectedRole = 'User'

  // DATA
  Roles: any[] = []
  RoleUsers:any[] = []
  Permissions: EndpointData[] = []
  CategorizedPermissions: EndpointCategory[] = []

  // SERVICES
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)
  PermissionsService = inject(PermissionsService)
  AuthService = inject(AuthService)

  // VARIABLES
  CanCreate = this.AuthService.PagePermissions.CanCreate

  // STATES
  LoadingRoles = true
  LoadingUsers = true
  LoadingPermissions = true


  async LoadPermissions() {
    this.LoadingPermissions = true

    const [EndpointPermissions] =
      await this.HttpService.MakeRequest(AppSettings.APIUrl + 'role-permissions', 'GET', 'Failed to fetch role permissions') as [any[]]

    // Convert the backend data to have the required values
    const ConvertedResult: { [key: string]: EndpointData } = {}

    for (const EndpointData of Object.values(EndpointPermissions)) {
      if (!EndpointData.Unprotected) {
        let ConvertedEndpointData: EndpointData = ConvertedResult[EndpointData.DisplayName]

        const SplittedID = EndpointData.ID.split('/')
        const PermissionType = SplittedID[0]
        const Endpoint = SplittedID.slice(1, SplittedID.length).join('/')

        if (!ConvertedEndpointData) {
          ConvertedEndpointData = {
            Endpoint: Endpoint,
            DisplayName: EndpointData.DisplayName,
            Category: EndpointData.Category,
            Summary: EndpointData.Summary,
            PermissionTypes: []
          }
          ConvertedResult[EndpointData.DisplayName] = ConvertedEndpointData
        }

        // Find array with the proper permission type
        let PermissionTypesArray = ConvertedEndpointData.PermissionTypes.find((Info: any) => {
          return Info.PermissionType == PermissionType
        })

        if (!PermissionTypesArray) {
          ConvertedEndpointData.PermissionTypes.push({
            Summary: EndpointData.Summary,
            TypeLabel: EndpointData.TypeLabel,
            PermissionType: PermissionType,
            PermissionLevels: []
          })
          const ResultIndex = ConvertedEndpointData.PermissionTypes.length - 1
          PermissionTypesArray = ConvertedEndpointData.PermissionTypes[ResultIndex]
        }

        PermissionTypesArray.PermissionLevels = [
          ...PermissionTypesArray.PermissionLevels,
          ...EndpointData.Permissions
        ];
      }
    }

    // Sort display names by manual configuration
    const config = ['Sessions', 'Stations', 'Meetings', 'Rooms'];
    const FinalResult = Object.values(ConvertedResult).sort((a, b) => {
      const indexA = config.indexOf(a.DisplayName);
      const indexB = config.indexOf(b.DisplayName);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });

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
    this.Permissions = FinalResult

    this.LoadingPermissions = false
  }

  async PermissionSwitchTriggered(EndpointData: EndpointData, PermissionInfo: PermissionInfo, Enabled: Boolean) {
    if (Enabled)
      this.AddEndpointPermissions(EndpointData, PermissionInfo)
    else
      this.RemoveEndpointPermissions(EndpointData, PermissionInfo)

  }

  //DELETE/UNLINK PERMISSIONS
  async RemoveEndpointPermissions(EndpointData: EndpointData, PermissionInfo: PermissionInfo) {

    PermissionInfo.Changing = true

    const DeleteSuccess = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'role-permissions', 'DELETE', `Failed to remove permissions for ${this.SelectedRole}`,
      {
        endpoint: EndpointData.Endpoint,
        method: PermissionInfo.PermissionType,
        permission_name: this.SelectedRole
      }
    )

    PermissionInfo.Changing = false

    if (DeleteSuccess) {
      this.MessageService.success('Sucessfully removed permissions')
      this.LoadPermissions()
    }
  }


  //ADD ENDPOINT PERMISSIONS
  async AddEndpointPermissions(EndpointData: EndpointData, PermissionInfo: PermissionInfo) {

    PermissionInfo.Changing = true

    const InsertSuccess = await this.HttpService.MakeRequest(this.RolePermissionsURL, 'POST', 'Failed to add endpoint permissions',
      {
        endpoint: EndpointData.Endpoint,
        method: PermissionInfo.PermissionType,
        permission_name: this.SelectedRole
      }
    )

    PermissionInfo.Changing = false

    if (InsertSuccess) {
      this.MessageService.success("Successfully added endpoint permissions!")
      this.LoadPermissions()
    }
  }

  async LoadRoleUsers() {
    this.LoadingUsers = true

    this.RoleUsers = []
    const [RoleUsers] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'role-users', 'GET', 'Failed to load role users', {
      role: this.SelectedRole
    })
    if (RoleUsers) {
      this.RoleUsers = RoleUsers.Rows
    }

    this.LoadingUsers = false
  }

  async ChangeRole(NewRole:string){
    this.SelectedRole  = NewRole
    await this.LoadRoleUsers()
  }

  async LoadRoles() {
    this.LoadingRoles = true

    const Roles = await this.PermissionsService.LoadRoles()
    if (Roles) {
      this.Roles = Roles.reverse()
      await this.ChangeRole(Roles[0]?.role)
    }

    this.LoadingRoles = false
  }

  async ngOnInit() {
     this.LoadRoles()
     this.LoadPermissions()
  }
}
