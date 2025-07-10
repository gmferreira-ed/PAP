import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import PermissionsService from '../Services/PermissionsService';
import SQLUtils from '../Services/SQLUtils';
import { ResultSetHeader } from 'mysql2';
import bcrypt from "bcrypt"


/**
 * @displayname "Check Authentication"
 * @category "Authentication"
 * @path /auth
 * @method POST
 * @summary "Check if user is authenticated and return user data with permissions"
 * @unprotected true
 */
Router.post('/auth', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (user && !req.session.pending_verification) {

        const EndpointPerms = await PermissionsService.EndpointsData.Get()

        res.send({ user: user, role_permissions: EndpointPerms })
    } else {
        res.status(401).send({ error: 'No login' })
    }
}))

const saltRounds = 10

async function VerifyPassword(ClientPassword:string, HashedPassword:string) {
  const match = await bcrypt.compare(ClientPassword, HashedPassword);
  if (match) {
    return true
  } else {
    return false
  }
}

async function HashPassword(ClientPassword:string) {
  const hashedPassword = await bcrypt.hash(ClientPassword, saltRounds);
  return hashedPassword;
}


/**
 * @displayname "Login"
 * @category "Authentication"
 * @path /auth/login
 * @method POST
 * @summary "Authenticate user with username and password"
 * @unprotected true
 */
Router.post('/auth/login', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (!user || req.session.pending_verification) {

        const username = req.body.username
        const PasswordGuess = req.body.password

        const UserQuery = `SELECT password, userid, verified, active, email FROM users WHERE username = ?`
        const [Result] = await Database.execute<any>(UserQuery, [username])

        const UserInfo = Result[0]
        if (UserInfo) {
            if (await VerifyPassword(PasswordGuess, UserInfo.password)) {
                if (UserInfo.active && UserInfo.verified) {
                    req.session.user = username
                    req.session.userid = UserInfo.userid
                    res.send({ username: username })
                } else if (!UserInfo.verified) {
                    req.session.user = username
                    req.session.userid = UserInfo.userid
                    req.session.pending_verification = true
                    res.status(403).send({ error: 'Your account is currently not verified', email: UserInfo.email })
                } else {
                    res.status(401).send({ error: 'This user is not currently active' })
                }
            } else {
                res.status(401).send({ error: 'Incorrect password' })
            }
        } else {
            res.status(404).send({ error: 'User does not exist' })
        }
    } else {
        res.status(401).send({ error: 'Already logged in' })
    }
}))

/**
 * @displayname "Sign Up"
 * @category "Authentication"
 * @path /auth/signup
 * @method POST
 * @summary "Create a new user account and authenticate"
 * @unprotected true
 */
Router.post('/auth/signup', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (!user || req.session.pending_verification) {
        const UserInfo = req.body
        UserInfo.password = HashPassword(UserInfo.password)

        try {
            const [UserCreateQuery, Values] = SQLUtils.BuildInsertQuery('users', [
                'username', 'email', 'phone', 'fullname', 'birthdate', 'country', 'city', 'address', 'postalcode', 'password'
            ], UserInfo)
            const [UserCreateResult] = await Database.execute(UserCreateQuery, Values) as ResultSetHeader[]


            req.session.pending_verification = true
            req.session.user = UserInfo.username
            req.session.userid = UserCreateResult.insertId

            await PermissionsService.GenerateUserCode(req)
        } catch (err: any) {
            if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                if (err.sqlMessage.includes('email')) {
                    res.status(401).send({ error: "This email is already in use" });
                } else if (err.sqlMessage.includes('phone')) {
                    res.status(401).send({ error: "This phone is already in use" });

                } else if (err.sqlMessage.includes('username')) {
                    res.status(401).send({ error: "This username is already in use" });
                } else {
                    res.status(502).send({ error: "Unknown error" });
                }
            } else {
                throw err
            }
        }


        res.send()
    } else {
        res.status(401).send({ error: 'Already logged in' })
    }
}))



/**
 * @displayname "Verify Account"
 * @category "Authentication"
 * @path /auth/verify
 * @method POST
 * @summary "Verify user account with verification code"
 * @unprotected true
 */
Router.post('/auth/verify', HandleEndpointFunction(async (req, res) => {
    const HasValidCode = PermissionsService.VerifyUserCode(req)
    if (HasValidCode) {
        const UserActivateQuery = `UPDATE users SET verified=1 WHERE userid=${req.session.userid} `
        const [UserActivateResult] = await Database.execute(UserActivateQuery)
        req.session.pending_verification = false
        res.send()
    } else {
        res.status(401).send({ error: 'Invalid code' })
    }
}))


/**
 * @displayname "Logout"
 * @category "Authentication"
 * @summary "Logs a user out"
 * @path /auth/logout
 * @method POST
 * @unprotected true
 */
Router.post('/auth/logout', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (user) {
        req.session.destroy(() => {
            res.send({ sucess: true })
        })
    } else {
        res.status(401).send({ error: 'No login' })
    }
}))


/**
 * @displayname "Request Verification Code"
 * @category "Authentication"
 * @summary "Request a verification code for account actions"
 * @path /request-code
 * @method POST
 * @unprotected true
 */
Router.post('/request-code', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (user) {

        const Now = new Date().getTime()
        const LastCodeCreation = req.session.verificationcode_created
        const SecondsSinceCreation = LastCodeCreation && (Now - LastCodeCreation) / 1000

        

        if (!SecondsSinceCreation || SecondsSinceCreation > 15) {
            await PermissionsService.GenerateUserCode(req)
            res.send()
        } else {
            res.status(401).send({ error: 'You are requesting codes too fast!' })
        }

    } else {
        res.status(401).send({ error: 'No login' })
    }
}))

module.exports = Router