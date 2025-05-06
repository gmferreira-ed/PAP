import { inject, Injectable, isDevMode, signal } from '@angular/core';
import { AppSettings } from './AppSettings';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot } from '@angular/router';
import { HttpService } from './Http.service';

const Methods = ['GET', 'POST', 'PATCH', 'DELETE']
type Method = typeof Methods[number]



@Injectable({
  providedIn: 'root'
})

export class AuthService {

  router = inject(Router)
  HttpService = inject(HttpService)
  User = signal<User | undefined>(undefined)
  IsPageAdmin = signal<boolean>(false)
  AccessibleRoutes: any = []
  EndpointPermissions: any = []

  Methods = Methods

  GetEndpointIdentifier(Endpoint: string, Method: Method) {
    const NormalizedEndpoint = Endpoint.replace(/^\/+/, '') + '/';
    return `${Method}/api/${NormalizedEndpoint}`
  }

  HasEndpointPermission(Endpoint: string, method: Method) {
    const EndpointID = this.GetEndpointIdentifier(Endpoint, method)
    
    const EndpointPermissions = this.EndpointPermissions[EndpointID]
    const UserPermissionLevel = this.User()?.permission_level || 0

    if (EndpointPermissions && EndpointPermissions.permission_level <= UserPermissionLevel) {
      return true
    } else {
      return false
    }
  }

  CanAccessRoute(Path?: string | undefined) {
    if (!Path) {
      Path = this.router.url
    }
    return this.AccessibleRoutes[Path]
  }

  async Login(ActivateRoute: ActivatedRouteSnapshot) {
    const AuthURL = new URL('auth', AppSettings.APIUrl)
    const [AuthResponse] = await this.HttpService.MakeRequest(AuthURL, 'POST')


    if (AuthResponse) {
      const User = AuthResponse.user
      const EndpointPermissions = AuthResponse.role_permissions

      console.log("Logged in successfully as", User)

      this.EndpointPermissions = EndpointPermissions
      return [User, EndpointPermissions]


    } else if (!ActivateRoute.data['NoLogin']) {
      this.router.navigate(['/login'])
    }
    return [null, {}]
  }

  Routes: any = {}

  GetAllRoutes(routes: any[] | undefined, parentPath: string = '') {
    if (routes) {
      for (const route of routes) {
        const fullPath = parentPath + '/' + (route.path || '');
        route.fullPath = fullPath
        this.Routes[fullPath] = route
        if (route.children) {
          this.GetAllRoutes(route.children, fullPath);
        }
      }
    }
    return this.Routes
  }


  Authenticating: boolean | Promise<any> = false

  async Authenticate(CurrentPage: ActivatedRouteSnapshot, State: RouterStateSnapshot): Promise<[boolean, boolean?]> {


    const [User, EndpointPermissions, IgnoreRedirect] = await this.Login(CurrentPage)
    const RouteData = CurrentPage.data

    // Load permissions data
    if (User) {
      this.User.set(User)

      const Routes: { [key: string]: Route } = this.GetAllRoutes(this.router.config[0].children)

      const CurrentPagePath = CurrentPage.url[0].path
      const CurrentPageURL = State.url
      //const ProtectedRoutes = this.router.config[0].children

      const UserPermissionLevel:number = User.permission_level
      
      for (const [RouterPath, RouterInfo] of Object.entries(Routes)) {

        const RouterURL = RouterInfo.path
        const RouterData = RouterInfo.data
        const AccessEndpoint = RouterData && RouterData['AccessEndpoint']


        if (AccessEndpoint) {
          const AccessEndpointPath = "GET/" + AccessEndpoint + "/"
          const EndpointPermission = EndpointPermissions[AccessEndpointPath]

          // if (EndpointPermission){
          //   console.log(AccessEndpointPath, UserPermissions.permission_level , EndpointPermission.permission_level)
          // }

          if (!EndpointPermission || UserPermissionLevel >= EndpointPermission.permission_level) {

            let IsAdmin = false
            const AdminEndpoint = RouterData['AdminEndpoint']
            if (AdminEndpoint) {
              const AdminEndpointPath = "POST/" + AdminEndpoint + "/"
              const AdminEndpointPermission = EndpointPermissions[AdminEndpointPath]

              //console.log(AdminEndpointPath, AdminEndpointPermission)
              if (AdminEndpointPermission && UserPermissionLevel >= AdminEndpointPermission.permission_level) {
                IsAdmin = true
              }
            }

            this.AccessibleRoutes[RouterPath] = {
              IsAdmin: IsAdmin
            }
          }
        } else {
          this.AccessibleRoutes[RouterPath] = {
          }
        }
      }

      const CurrentPageData = this.AccessibleRoutes[CurrentPageURL]

      //    console.log(this.AccessibleRoutes)

      if (CurrentPageData) {
        if (CurrentPageData.IsAdmin) {
          this.IsPageAdmin.set(true)
          console.log("ADMIN VIEW")
        } else {
          this.IsPageAdmin.set(false)
        }
        console.log("User has endpoint access")
        return [true]
      }
    } else if (RouteData['NoLogin']) {
      return [true, true]
    }



    return [false, IgnoreRedirect]
  }



  constructor() { }
}
