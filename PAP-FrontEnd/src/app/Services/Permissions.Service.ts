import { inject, Injectable, signal } from '@angular/core'
import { HttpService } from './Http.service'
import { AppSettings } from './AppSettings'
import { AuthService } from './Auth.service'
import { UserRole } from '../../shared/permissions'
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class PermissionsService {

  HttpService = inject(HttpService)
  AuthService = inject(AuthService)
  Roles = []
  TranslateService = inject(TranslateService)
  

  FilterPermissions = (AcceptedPermissions: string[], UserInfo: any) => {
    if (!UserInfo.permission_level){
      UserInfo = UserInfo.Permissions
    }
    const HasPerm = AcceptedPermissions.includes(UserInfo.role)
    return HasPerm
  }
  
  SortPermissions = (PermissionA: any, PermissionB: any) => {
    if (!PermissionA.permission_level){
      PermissionA = PermissionA.Permissions
      PermissionB = PermissionB.Permissions
    }
    return PermissionB.permission_level - PermissionA.permission_level
  }

  // IsAboveRole(Role:any, CanBeEqual:boolean=true, IgnoreAdministratorship:boolean=false) {
  //   const UserPermissionLevel = this.AuthService.User()?.permission_level || 0
  //   const IsLastPermission = UserPermissionLevel == this.Roles.length

  //   if (IsLastPermission && !IgnoreAdministratorship){
  //     CanBeEqual = true
  //   }
    
  //   if (CanBeEqual && UserPermissionLevel >= Role.permission_level || UserPermissionLevel > Role.permission_level){
  //     return true
  //   }else{
  //     return false
  //   }
  // }

  async LoadRoles():Promise<UserRole[]> {
    const RolesURL = new URL('roles', AppSettings.APIUrl)
    let [Roles] = await this.HttpService.MakeRequest(RolesURL, 'GET', this.TranslateService.instant('Failed to fetch roles'))

    if (Roles) {
      Roles = Roles.map((Role: any) => ({
        name: Role.name,
        permission_level: Role.permission_level,
        administrator: Role.administrator == 1,
        locked: Role.locked == 1,
        // FOR NG ZORRO COMPONENTS
        text: Role.name,
        label: Role.name,
        value: Role.name
      }))
    } else {
      Roles = []
    }

    this.Roles = Roles
    return Roles
  }

}
