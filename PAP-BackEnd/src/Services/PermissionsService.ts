import GlobalConfigs from '../Config/GlobalConfigs';
import { Database, ErrorResponse, EndpointsAttributes, EndpointRegex } from '../Globals'
import SimpleCache from "../../../PAP-FrontEnd/src/shared/SimpleCache"
import nodemailer from 'nodemailer'
const crypto = require('crypto');

import { Request, Response, NextFunction, RequestHandler } from 'express';

const MailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gabrielmonteiroferreira@gmail.com",
    pass: process.env.mail_pass
  }
})


var EndpointsData = new SimpleCache(async function (): Promise<Endpoints> {

  const StartTime = Date.now()
  const PermissionsQuery = `SELECT * FROM role_permissions ep`
  const [EndpointPermissionProfiles] = await Database.query<any>(PermissionsQuery);

  const EndpointPermissionsObject: Record<string, string[]> = {} // Object with endpoints and the roles allowed to access it

  EndpointPermissionProfiles.forEach((info: any) => {
    const EndpointID = info.endpoint_id

    if (!EndpointPermissionsObject[EndpointID]) {
      EndpointPermissionsObject[EndpointID] = []
    }

    EndpointPermissionsObject[EndpointID].push(info.role)
  });


  const FinalResult: Endpoints = {}

  for (const [EndpointID, EndpointAttributes] of Object.entries(EndpointsAttributes)) {

    const EndpointDBPermissions = EndpointPermissionsObject[EndpointID] ||
      (EndpointAttributes.Connected && EndpointPermissionsObject[EndpointAttributes.Connected])

    let EndpointData = FinalResult[EndpointID]

    if (!EndpointData) {
      EndpointData = {
        ID: EndpointID,
        ...EndpointAttributes,
        Permissions: [],
      }
      FinalResult[EndpointID] = EndpointData
    }

    if (EndpointDBPermissions) {
      EndpointData.Permissions = EndpointDBPermissions
    }

  }

  if (GlobalConfigs.BenchmarkingMode)
    console.log(`Took ${Date.now() - StartTime} ms to fetch endpoint permissions`)

  //console.log(FinalResult)
  return FinalResult
}, 15)


async function GenerateUserCode(Request: ExpressRequest) {
  const Code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');

  Request.session.verificationcode = Code
  Request.session.verificationcode_created = new Date().getTime()

  console.log('Code', Code)

  const UserData = await GetUserData(Request.session.user!)
  let Fullname = UserData.fullname
  let Email = UserData.email
  await MailTransport.sendMail({
    // from: mail_config.auth.user,
    to: Email,
    subject: 'Restro Link Verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 32px 24px; background: #fafbfc;">
        <h2 style="color: #333; margin-bottom: 16px;">Your Verification Code</h2>
        <p style="font-size: 16px; color: #444; margin-bottom: 24px;">
          Hello <b>${Fullname || ''}</b>,
        </p>
        <p style="font-size: 16px; color: #444; margin-bottom: 24px;">
          Please use the following code to verify your account:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="display: inline-block; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #1976d2; background: #e3f2fd; padding: 16px 32px; border-radius: 8px; border: 1px solid #bbdefb;">
            ${Code}
          </span>
        </div>
        <p style="font-size: 14px; color: #888;">
          This code will expire in a few minutes. If you did not request this, please ignore this email.
        </p>
        <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #bbb; text-align: center;">
          &copy; ${new Date().getFullYear()} Restro Link
        </p>
      </div>
    `
  })

  return Code
}
function VerifyUserCode(Request: ExpressRequest) {
  const VerificationCode = Request.session.verificationcode
  const SentVerificationCode = Request.body.verificationcode

  if (VerificationCode && SentVerificationCode == VerificationCode) {
    Request.session.verificationcode = undefined
    return true
  } else {
    return false
  }
}

async function CheckPermissions(Route: string, Request: Request, ParamUser?: string) {

  const User = (ParamUser || Request.session.user) as string

  const Permissions: Endpoints = await EndpointsData.Get()
  let EndpointData = Permissions[Route]


  // Support /* to include all endpoints after it
  // For example, angular uses the main endpoint, in this case /app, to fetch assets (Ex: /app/favicon.ico)
  // Instead of checking if the route contains "app" or unprotecting each asset /app provides, i added support to wildcard routes
  if (!EndpointData) {
    const MotherRoute = Route.split('/').slice(0, 3).join('/') + '/*'
    if (Permissions[MotherRoute]?.Unprotected) {
      return [true]
    }
  }

  if (EndpointData.Connected) {
    EndpointData = Permissions[EndpointData.Connected]
  }

  const IsRootEndpoint = Route.includes('auth') || EndpointData.Root
  if (IsRootEndpoint) {
    return [true]
  }

  // By default, anyone has permissions
  if (!EndpointData) {
    console.error("Missing permissions data on", Route)
    return [false, 502, 'This endpoint has missing permissions data.']
  }




  if (User) {
    try {

      if (EndpointData?.Unprotected) {
        return [true]
      }

      //const UserBypass = RequiredPermission?.user_bypass == 1
      const UserData = await GetUserData(User)

      // Has Required level
      const IsGlobal = EndpointData.Permissions.includes('User')
      const IsAdmin = UserData.administrator

      if ((EndpointData.Permissions.includes(UserData.role) || IsGlobal || IsAdmin) && UserData.active && UserData.verified) {
        return [true, IsGlobal]
      }


      console.error('Acces denied to',Route)
      // Deny access
      return [false, 401, 'Unauthorized']
    } catch (error) {
      console.warn(error)
      return [false, 502, 'Internal server error']
    }
  } else {
    console.warn('No login')
    return [false, 401, 'No login']
  }
}



async function PermissionsMiddleware(request: Request, response: Response, next: NextFunction): Promise<any> {
  const StartTS = Date.now()

  let Route = `${request.method}${request.path}`
  if (Route.endsWith('/')) {
    Route = Route.slice(0, -1);
  }
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

let HardCodedAdmins = ['gmferreira']

async function GetUserData(User: string): Promise<User> {
  const UserPermissionsQuery = `SELECT userid, username, administrator, card_id, created, email, fullname, permission_level,
  role, verified, active
   FROM users JOIN roles ON users.role = roles.name WHERE username = ?`
  const [Users] = await Database.execute<any>(UserPermissionsQuery, [User]);


  let UserData = Users[0]

  // Check for hardcoded admins, security measure for mantainers
  if (HardCodedAdmins.includes(User.toString())) {
    UserData = {
      ...UserData,
      permission_level: 99999,
      permission_name: 'Admin',
      administrator: true,
    }
  }

  return UserData
}


export default {
  PermissionsMiddleware: PermissionsMiddleware,
  EndpointsData: EndpointsData,
  GetUserData: GetUserData,
  VerifyUserCode: VerifyUserCode,
  GenerateUserCode: GenerateUserCode,
}
