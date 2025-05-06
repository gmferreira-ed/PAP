
import GlobalConfigs from '../Config/GlobalConfigs';
import { Database, ErrorResponse, EndpointsAttributes, EndpointMatches, EndpointRegex } from '../Globals'
import SimpleCache from "./SimpleCache"

import { Request, Response, NextFunction, RequestHandler } from 'express';




var EndpointsData = new SimpleCache(async function ():Promise<Endpoints> {

  const StartTime = Date.now()
  const PermissionsQuery = `SELECT * FROM role_permissions ep`
  const [EndpointPermissionProfiles] = await Database.query<any>(PermissionsQuery);

  const EndpointPermissionsObject: Record<string, string[]> = {};

EndpointPermissionProfiles.forEach((info: any) => {
  const id = `${info.method}/${info.endpoint}`;

  if (!EndpointPermissionsObject[id]) {
    EndpointPermissionsObject[id] = [];
  }

  EndpointPermissionsObject[id].push(info.role);
});


  const FinalResult:Endpoints = {}

  for (const [EndpointID, EndpointAttributes] of Object.entries(EndpointsAttributes)) {

    const EndpointDBPermissions = EndpointPermissionsObject[EndpointID]
    let EndpointInfo:EndpointData = FinalResult[EndpointID]

    if (!EndpointInfo){
      EndpointInfo = {
        ID: EndpointID,
        DisplayName: EndpointAttributes.DisplayName,
        Category: EndpointAttributes.Category || 'General',
        TypeLabel: EndpointAttributes.TypeLabel,
        Unprotected: EndpointAttributes.Unprotected,
        Permissions: [],
        Summary: EndpointAttributes.Summary,
      }
      FinalResult[EndpointID] = EndpointInfo
    }

    if (EndpointDBPermissions){
      EndpointInfo.Permissions = EndpointDBPermissions
    }

  }

  if (GlobalConfigs.BenchmarkingMode)
    console.log(`Took ${Date.now() - StartTime} ms to fetch endpoint permissions`)

  //console.log(FinalResult)
  return FinalResult
}, 15)




async function GetUserPermissions(User: User | string) {
  const UserPermissionsQuery = `SELECT * FROM users JOIN roles ON users.role = roles.name WHERE users.username = ?`
  const [permission_profiles] = await Database.execute<any>(UserPermissionsQuery, [User]);


  let UserPermissions = permission_profiles[0]
  if (!UserPermissions) {
    UserPermissions = {
      permission_level: 1,
      role: "user"
    }
  }

  return UserPermissions
}

async function CheckPermissions(Route: string, Request: Request, ParamUser?: string) {

  const User = (ParamUser || Request.session.user) as string

  const Permissions:Endpoints = await EndpointsData.Get()
  const EndpointData = Permissions[Route]

  // Support /* to include all endpoints after it
  // For example, angular uses the main endpoint, in this case /app, to fetch assets (Ex: /app/favicon.ico)
  // Instead of checking if the route contains "app" or unprotecting each asset /app provides, i added support to wildcard routes
  if (!EndpointData){
    const MotherRoute = Route.split('/').slice(0, 3).join('/')+'/*'
    if (Permissions[MotherRoute]?.Unprotected){
      return [true]
    }
  }


  // By default, anyone has permissions
  if (EndpointData?.Unprotected) {
    return [true]
  }else if (!EndpointData){
    console.error("Missing permissions data on",Route)
    return [false, 502, 'This endpoint has missing permissions data.']
  }


  if (User) {
    try {

      //const UserBypass = RequiredPermission?.user_bypass == 1
      const UserPermProfile = await GetUserPermissions(User)

      // Has Required level
      const IsGlobal = EndpointData.Permissions.includes('User')
      const IsAdmin = UserPermProfile.administrator

      if (EndpointData.Permissions.includes(UserPermProfile.role) || IsGlobal || IsAdmin) {
        return [true, IsGlobal]
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



async function PermissionsMiddleware(request: Request, response: Response, next: NextFunction): Promise<any> {
  const StartTS = Date.now()

  const MethodMatch = EndpointMatches[request.method]
  const Route = `${MethodMatch}${request.path}`.replace(EndpointRegex, '$1/')

  const Session = request.session

  //console.log(User, Route, Session.id)

  const [HasAccess, ErrorCode, Error] = await CheckPermissions(Route, request)

  if (GlobalConfigs.BenchmarkingMode) {
    //console.log(`Permissions middleware took ${Date.now()-StartTS}ms`);
  }
  if (HasAccess) {
    next()
  } else {
    ErrorResponse(ErrorCode, Error, response)
  }
  return HasAccess
}

export default {
  PermissionsMiddleware: PermissionsMiddleware,
  EndpointsData: EndpointsData,
  GetUserPermissions: GetUserPermissions,
}
