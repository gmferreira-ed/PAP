
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import PermissionsService from '../Services/PermissionsService';
import SQLUtils from '../Services/SQLUtils';
import { ResultSetHeader } from 'mysql2';


/**
 * @displayname "Authentication"
 * @path /auth
 * @method POST
 * @summary "Authenticates in the application"
 * @unprotected true
 */
Router.post('/auth', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (user) {
        const EndpointPerms = await PermissionsService.EndpointsData.Get()

        res.send({ user: user, role_permissions: EndpointPerms })
    } else {
        res.status(401).send({ error: 'No login' })
    }
}))

/**
 * @displayname "Login"
 * @path /auth/login
 * @method POST
 * @summary "Authenticates in the application"
 * @unprotected true
 */
Router.post('/auth/login', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (!user) {

        const username = req.body.username
        const password = req.body.password

        const UserQuery = `SELECT password, userid, verified, active FROM users WHERE username = ?`
        const [Result] = await Database.execute<any>(UserQuery, [username])

        const UserInfo = Result[0]
        if (UserInfo) {
            if (UserInfo.active && UserInfo.verified) {
                if (UserInfo.password == password) {
                    req.session.user = username
                    req.session.userid = UserInfo.userid
                    res.send({ username: username })
                } else {
                    res.status(401).send({ error: 'Incorrect password' })
                }
            } else if (!UserInfo.verified) {
                res.status(401).send({ error: 'Your account is not current verified' })
            } else {
                res.status(401).send({ error: 'This user is not currently active' })
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
 * @path /auth/signup
 * @method POST
 * @summary "Creates an account and authenticates in the application"
 * @unprotected true
 */
Router.post('/auth/signup', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (!user) {
        const UserInfo = req.body

        const [UserCreateQuery, Values] = SQLUtils.BuildInsertQuery('users', [
            'username', 'email', 'phone', 'fullname', 'birthdate', 'country', 'city', 'address', 'postalcode', 'password'
        ], UserInfo)
        const [UserCreateResult] = await Database.execute(UserCreateQuery, Values) as ResultSetHeader[]


        req.session.user = UserInfo.username
        req.session.userid = UserCreateResult.insertId

        await PermissionsService.GenerateUserCode(req)

        res.send()
    } else {
        res.status(401).send({ error: 'Already logged in' })
    }
}))

/**
 * @displayname "Verify account"
 * @path /auth/verify
 * @method POST
 * @summary "Creates an account and authenticates in the application"
 * @unprotected true
 */
Router.post('/auth/verify', HandleEndpointFunction(async (req, res) => {
    const HasValidCode = PermissionsService.VerifyUserCode(req)
    if (HasValidCode) {
        const UserActivateQuery = `UPDATE users SET verified=1 WHERE userid=${req.session.userid} `
        const [UserActivateResult] = await Database.execute(UserActivateQuery)
        res.send()
    } else {
        res.status(401).send({ error: 'Invalid code' })
    }
}))


/**
 * @displayname "Logout"
 * @path /auth/logout
 * @method POST
 * @summary "Logs a user out
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
 * @displayname "Request Code"
 * @path /request-code
 * @method POST
 * @summary "Request a verification code, multi purpose"
 * @unprotected true
 */
Router.post('/request-code', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (user) {

        const Now = new Date().getTime()
        const LastCodeCreation = req.session.verificationcode_created
        const SecondsSinceCreation = LastCodeCreation && (Now - LastCodeCreation) / 1000

        if (!SecondsSinceCreation || SecondsSinceCreation > 15) {
            res.send()
            await PermissionsService.GenerateUserCode(req)
        } else {
            res.status(401).send({ error: 'You are requesting codes too fast!' })
        }

    } else {
        res.status(401).send({ error: 'Already logged in' })
    }
}))

module.exports = Router