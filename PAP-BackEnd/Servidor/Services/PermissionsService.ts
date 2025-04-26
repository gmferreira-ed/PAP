
import { Database, ErrorResponse } from '../Globals'
import SimpleCache from "./SimpleCache"

import { Request, Response, NextFunction, RequestHandler } from 'express';


var EndpointPermissions = new SimpleCache(async function () {
  const PermissionsQuery = `SELECT * FROM endpoint_permissions ep JOIN permission_levels pl ON ep.permission_name = pl.permission_name`
  const [Result] = await Database.promise().query(PermissionsQuery);

  return Object.fromEntries(
    Result.map((Data:any) => [`${Data.method}/${Data.endpoint}`, {
      permission_name:Data.permission_name,
      permission_level:Data.permission_level,
      user_bypass:Data.user_bypass,
    }])
  );
}, 15)

async function GetUserPermissions(User:string){
  const UserPermissionsQuery = `SELECT * FROM permission_profiles pp JOIN permission_levels pl ON pp.permission_name = pl.permission_name WHERE user = ?`
  const [permission_profiles] = await Database.promise().execute(UserPermissionsQuery, [User]);

  let UserPermissions = permission_profiles[0]
    if (!UserPermissions){
        UserPermissions = {
            permission_level:1,
            permission_name:"user"
        }
    }

  return UserPermissions
}

async function CheckPermissions(Route:string, Request:Request, ParamUser?:string) {

  const User = ParamUser || Request.session?.user

  const Permissions = await EndpointPermissions.Get()
  const RequiredPermission = Permissions[Route]


  // By default, anyone has permissions
  if (!RequiredPermission || RequiredPermission.permission_level == 1) {
    //console.log('Ignoring endpoint permissions check for',Route)
    return [true]
  }


  if (User) {
    try {

      const UserBypass = RequiredPermission.user_bypass == 1
      const UserPermProfile = await GetUserPermissions(User)

      // Has Required level
      if (UserPermProfile.permission_level >= RequiredPermission.permission_level){
        return [true]
      }

      // Endpoint has user bypass attribute
      const ModifiedUser = Request.body?.user || Request.query?.user || Request.params?.user
      if (UserBypass && User == ModifiedUser){
        return [true]
      }
      // Deny access
      return [false, 401, 'Unauthorized']
    } catch (error) {
      console.warn(error)
      return [false, 502, 'Internal server error']
    }
  } else {
    return [false, 401, 'No login']
  }
}



async function PermissionsMiddleware(request:Request, response:Response, next:NextFunction):Promise<any>{
  const Route = `${request.method}${request.path}/`;

  const Session = request.session
  
  //console.log(User, Route, Session.id)

  const [HasAccess, ErrorCode, Error] = await CheckPermissions(Route, request)
  if (HasAccess){
    next()
  }else{
    ErrorResponse(ErrorCode, Error, response)
  }
  return HasAccess
}

export default  {
  PermissionsMiddleware: PermissionsMiddleware,
  EndpointPermissions: EndpointPermissions,
  GetUserPermissions: GetUserPermissions,
}
