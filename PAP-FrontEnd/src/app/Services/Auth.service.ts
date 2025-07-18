import { inject, Injectable, isDevMode, signal } from '@angular/core';
import { AppSettings } from './AppSettings';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot } from '@angular/router';
import { HttpService } from './Http.service';
import { TranslateService } from '@ngx-translate/core';

const RequestTypes = ['GET', 'POST']
type RequestType = typeof RequestTypes[number]

type PagePermissions = {
  CanView?: boolean,
  CanModify?: boolean,
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  router = inject(Router)
  HttpService = inject(HttpService)
  TranslateService = inject(TranslateService)
  User = signal<string | null>(null)
  UserPermissions: any = {}
  IsPageAdmin = signal<boolean>(false)
  AccessibleRoutes: any = []
  EndpointPermissions: any = []

  PagePermissions: PagePermissions = {}

  GetEndpointIdentifier(Endpoint: string, RequestType: RequestType) {
    let NormalizedEndpoint = Endpoint.replace(/^\/+/, '');

    if (!NormalizedEndpoint.startsWith('api/')) {
      NormalizedEndpoint = 'api/' + NormalizedEndpoint;
    }

    return `${RequestType}/${NormalizedEndpoint}`;
  }

  HasEndpointPermission(Endpoint: string, RequestType: RequestType) {
    const EndpointID = this.GetEndpointIdentifier(Endpoint, RequestType)

    const UserPerms = this.UserPermissions
    const EndpointInfo = this.EndpointPermissions[EndpointID]
    const EndpointPermissions = EndpointInfo?.Permissions
    const IsAdmin = UserPerms.administrator == 1

    

    const IsGlobal = EndpointPermissions?.includes('User')
    const HasPerm = IsGlobal || EndpointPermissions?.includes(UserPerms.role) || EndpointInfo?.Unprotected || IsAdmin
   

    if (HasPerm) {
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

    const ErrorMessage = !ActivateRoute.data['IgnoreRedirect'] && this.TranslateService.instant('Failed to authenticate Please try again')
    const [AuthSuccess, ErrorInfo] = await this.HttpService.MakeRequest(AuthURL, 'POST', ErrorMessage
    )

    const TargetPageURL = ActivateRoute.routeConfig?.path


    if (AuthSuccess) {
      const User = AuthSuccess.user
      const EndpointPermissions = AuthSuccess.role_permissions
      this.EndpointPermissions = EndpointPermissions

      if (TargetPageURL == 'login' || TargetPageURL == 'register') {
        this.router.navigate(['/dashboard'])
      }

      return [User, EndpointPermissions]

    } else if ((!ActivateRoute.data['IgnoreRedirect']) && ErrorInfo?.ErrorCode == 401) {
      this.router.navigate(['/login'])
      return [null, {}]
    } else if (ErrorInfo?.ErrorCode != 401) {
      this.router.navigate(['/error'])
    }

    if (ActivateRoute.data['Unprotected']){
      return [false, {}, true]
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


    const [User, EndpointPermissions, Unprotected, IgnoreLoginRedirect] = await this.Login(CurrentPage)
    const RouteData = CurrentPage.data

    // Load permissions data
    if (User) {
      this.User.set(User)

      const Routes: { [key: string]: Route } = this.GetAllRoutes(this.router.config)

      const CurrentPageURL = this.getTemplatePath(CurrentPage)
      //console.log(CurrentPageURL)

      const AuthURL = new URL(`role-permissions/user`, AppSettings.APIUrl)

      const [UserPermissions] = await this.HttpService.MakeRequest(AuthURL, 'GET', this.TranslateService.instant('Failed to load user permissions. Please try again'))

      if (UserPermissions) {
        this.UserPermissions = UserPermissions

        // LOAD OTHER PAGE PERMISSIONS
        for (const [RouterPath, RouterInfo] of Object.entries(Routes)) {

          const RouterURL = RouterInfo.path
          const RouterData = RouterInfo.data

          if (RouterData) {
            const ViewEndpoint = RouterData['ViewEndpoint']
            const ModifyEndpoint = RouterData['ModifyEndpoint']

            const CanView = (!ViewEndpoint && !ModifyEndpoint) || (ViewEndpoint && this.HasEndpointPermission(ViewEndpoint, 'GET'))
            const CanModify = ModifyEndpoint && this.HasEndpointPermission(ModifyEndpoint, 'POST')

            this.AccessibleRoutes[RouterPath] = {
              CanView: CanView || CanModify, // Allow access in case there is only a create endpoint
              CanModify: CanModify,
            }
          } else {
            this.AccessibleRoutes[RouterPath] = { CanView: true }
          }
        }

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
    }



    return [Unprotected || false, IgnoreLoginRedirect]
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
