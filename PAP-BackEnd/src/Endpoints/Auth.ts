
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import PermissionsService from '../Services/PermissionsService';
import SQLUtils from '../Services/SQLUtils';


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

        res.send({ user: user, role_permissions:EndpointPerms })
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

        const UserQuery = `SELECT password, userid FROM users WHERE username = ?`
        const [Result] = await Database.execute<any>(UserQuery, [username])

        const UserInfo = Result[0]
        if (UserInfo) {
            if (UserInfo.password == password) {
                req.session.user = username
                req.session.userid = UserInfo.userid
                res.send({ username: username })
            } else {
                res.status(404).send({ error: 'Incorrect password' })
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
            'username', 'email', 'phone', 'fullname', 'birthdate', 'country', 'city', 'adress', 'postalcode', 'password'
        ], UserInfo)
        const [UserCreateResult] = await Database.execute(UserCreateQuery, Values)

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

    const user = req.session.user

    if (!user) {
        
    } else {
        res.status(401).send({ error: 'Already logged in' })
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

module.exports = Router