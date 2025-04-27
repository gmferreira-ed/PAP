import { inject, Injectable, signal } from '@angular/core'
import { HttpService } from './Http.service'
import { AppSettings } from './AppSettings'
import { AuthService } from './Auth.service'

@Injectable({
  providedIn: 'root'
})

export class PermissionsService {

  HttpService = inject(HttpService)
  AuthService = inject(AuthService)
  PermissionLevels = []

  FilterPermissions = (AcceptedPermissions: string[], UserInfo: any) => {
    if (!UserInfo.permission_level){
      UserInfo = UserInfo.Permissions
    }
    const HasPerm = AcceptedPermissions.includes(UserInfo.permission_name)
    return HasPerm
  }
  
  SortPermissions = (PermissionA: any, PermissionB: any) => {
    if (!PermissionA.permission_level){
      PermissionA = PermissionA.Permissions
      PermissionB = PermissionB.Permissions
    }
    return PermissionB.permission_level - PermissionA.permission_level
  }

  IsAbovePermission(PermissionData:any, CanBeEqual:boolean=true, IgnoreAdministratorship:boolean=false) {
    const UserPermissionLevel = this.AuthService.User()?.permission_level || 0
    const IsLastPermission = UserPermissionLevel == this.PermissionLevels.length

    if (IsLastPermission && !IgnoreAdministratorship){
      CanBeEqual = true
    }
    
    if (CanBeEqual && UserPermissionLevel >= PermissionData.permission_level || UserPermissionLevel > PermissionData.permission_level){
      return true
    }else{
      return false
    }
  }

  async LoadPermissionLevels() {
    const PermLevelsURL = new URL('permission-levels', AppSettings.APIUrl)
    let PermissionLevels = await this.HttpService.MakeRequest(PermLevelsURL, 'GET', 'Failed to fetch permission levels')

    if (PermissionLevels) {
      PermissionLevels = PermissionLevels.map((PermissionData: any) => ({
        permission_name: PermissionData.permission_name,
        permission_level: PermissionData.permission_level,
        // FOR NG ZORRO COMPONENTS
        text: PermissionData.permission_name,
        label: PermissionData.permission_name,
        value: PermissionData.permission_name
      }))
    } else {
      PermissionLevels = []
    }

    this.PermissionLevels = PermissionLevels
    return PermissionLevels
  }

}
