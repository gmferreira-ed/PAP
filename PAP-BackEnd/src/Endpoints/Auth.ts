
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetTablePage } from '../Globals'


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
        res.send({ user: user })
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

        const UserQuery = `SELECT password FROM users WHERE username = ?`
        const [Result] = await Database.execute<any>(UserQuery, [username])

        if (Result[0]) {
            if (Result[0].password == password) {
                req.session.user = username
                req.session.userid = Result.userid
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