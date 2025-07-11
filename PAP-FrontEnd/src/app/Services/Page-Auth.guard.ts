import { inject, Injectable } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AppSettings } from './AppSettings';
import { Observable } from 'rxjs';
import { AuthService } from './Auth.service';

export const PageAuthGuard: CanActivateChildFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService)
  
  /// Angular route guards are purely client sided. All the endpoints are protected with the dynamic permission system
  // Route guards are still used either way, to avoid normal users accessing routes that they should not
  // Routes permissions are dynamically synced with the API permissions

  // Due to angular being a Single Page Application, exploiters can still view unauthorized page's content
  // However, since the API's are protected and the pages use dynamic loading with the API response data, unauthorized accesses are insignificant

  let AuthenticationPromise
  if (!authService.Authenticating){
    AuthenticationPromise = authService.Authenticate(route, state)
    authService.Authenticating = AuthenticationPromise
  }else{
    AuthenticationPromise = authService.Authenticating
  }

  const [AuthenticationResult, IgnoreLoginRedirect] = await AuthenticationPromise

  authService.Authenticating = false
  if (AuthenticationResult){
    return true
  }
  
  if (!IgnoreLoginRedirect){
    router.navigate(['/login']);
  }
  return false;
};
