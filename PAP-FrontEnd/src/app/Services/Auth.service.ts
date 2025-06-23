import { inject, Injectable, isDevMode, signal } from '@angular/core';
import { AppSettings } from './AppSettings';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot } from '@angular/router';
import { HttpService } from './Http.service';

const PermissionTypes = ['GET', 'POST', 'PATCH', 'DELETE']
type PermissionType = typeof PermissionTypes[number]

type PagePermissions = {
  CanView?: boolean,
  CanUpdate?: boolean,
  CanCreate?: boolean,
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  router = inject(Router)
  HttpService = inject(HttpService)
  User = signal<string | null>(null)
  UserPermissions: any = {}
  IsPageAdmin = signal<boolean>(false)
  AccessibleRoutes: any = []
  EndpointPermissions: any = []

  PagePermissions: PagePermissions = {}
  PermissionTypes = PermissionTypes

  GetEndpointIdentifier(Endpoint: string, PermissionType: PermissionType) {
    const NormalizedEndpoint = Endpoint.replace(/^\/+/, '');
    return `${PermissionType}/${NormalizedEndpoint}`
  }

  HasEndpointPermission(Endpoint: string, PermissionType: PermissionType) {
    const EndpointID = this.GetEndpointIdentifier(Endpoint, PermissionType)

    const UserPerms = this.UserPermissions
    const EndpointInfo = this.EndpointPermissions[EndpointID]
    const EndpointPermissions = EndpointInfo?.Permissions
    const IsAdmin = UserPerms.administrator == 1


    const IsGlobal = EndpointPermissions?.includes('User')
    if (IsGlobal || EndpointPermissions?.includes(UserPerms.permission_name) || EndpointInfo?.Unprotected || IsAdmin) {
      return true
    } else {
      return false
    }
  }

  CanAccessRoute(Path?: string | undefined) {
    if (!Path) {
      Path = this.router.url
    }
    return this.AccessibleRoutes[Path]?.CanView
  }

  async Login(ActivateRoute: ActivatedRouteSnapshot) {
    const AuthURL = new URL('auth', AppSettings.APIUrl)
    const [AuthSuccess, ErrorInfo] = await this.HttpService.MakeRequest(AuthURL, 'POST', 'Failed to authenticate. Please try again')

    const TargetPageURL = ActivateRoute.routeConfig?.path

    if (AuthSuccess) {
      const User = AuthSuccess.user
      const EndpointPermissions = AuthSuccess.role_permissions
      this.EndpointPermissions = EndpointPermissions

      if (TargetPageURL == 'login' || TargetPageURL=='register') {
        this.router.navigate(['/dashboard'])
      }

      return [User, EndpointPermissions]

    } else if (!ActivateRoute.data['NoLogin'] && ErrorInfo?.ErrorCode == 401) {
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

    const NoLogin = RouteData['NoLogin']
    // Load permissions data
    if (User && !NoLogin) {
      this.User.set(User)

      const Routes: { [key: string]: Route } = this.GetAllRoutes(this.router.config)

      const CurrentPageURL = this.getTemplatePath(CurrentPage)
      //console.log(CurrentPageURL)

      const AuthURL = new URL(`role-permissions/user`, AppSettings.APIUrl)

      const [UserPermissions] = await this.HttpService.MakeRequest(AuthURL, 'GET', 'Failed to load user permissions. Please try again')

      if (UserPermissions) {
        this.UserPermissions = UserPermissions

        // LOAD OTHER PAGE PERMISSIONS
        for (const [RouterPath, RouterInfo] of Object.entries(Routes)) {

          const RouterURL = RouterInfo.path
          const RouterData = RouterInfo.data

          if (RouterData) {
            const ViewEndpoint = RouterData['ViewEndpoint']
            const CreateEndpoint = RouterData['CreateEndpoint']
            const UpdateEndpoint = RouterData['UpdateEndpoint']

            const CanView = (!ViewEndpoint && !CreateEndpoint) || (ViewEndpoint && this.HasEndpointPermission(ViewEndpoint, 'VIEW'))
            const CanCreate = CreateEndpoint && this.HasEndpointPermission(CreateEndpoint, 'CREATE')
            const CanUpdate = UpdateEndpoint && this.HasEndpointPermission(UpdateEndpoint, 'UPDATE')

            this.AccessibleRoutes[RouterPath] = {
              CanView: CanView || CanCreate, // Allow access in case there is only a create endpoint
              CanCreate: CanCreate,
              CanUpdate: CanUpdate
            }
          } else {
            this.AccessibleRoutes[RouterPath] = { CanView: true }
          }
        }

        //console.log( this.AccessibleRoutes)
        // CHECK CURRENT PAGE ACCESS
        if (CurrentPageURL) {
          const CurrentPageData = this.AccessibleRoutes[CurrentPageURL]
          this.PagePermissions = CurrentPageData

          if (CurrentPageData && CurrentPageData.CanView) {
            //console.log("User has endpoint access")
            return [true]
          } else {
            return [false]
          }

        }
      }
    } else if (NoLogin) {
      return [true]
    }



    return [false, IgnoreRedirect]
  }

  private getTemplatePath(route: ActivatedRouteSnapshot): string {
    const segments: string[] = [];

    while (route) {
      if (route.routeConfig?.path) {
        segments.unshift(route.routeConfig.path);
      }
      route = route.parent!;
    }

    return '/' + segments.join('/');
  }


  constructor() { }
}
