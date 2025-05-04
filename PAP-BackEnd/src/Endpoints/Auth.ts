
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetTablePage } from '../Globals'


Router.post('/auth', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (user) {
        res.send({ user: user })
    } else {
        res.status(401).send({ error: 'No login' })
    }
}))

Router.post('/auth/login', HandleEndpointFunction(async (req, res) => {

    const user = req.session.user

    if (!user) {

        const username = req.body.username
        const password = req.body.password

        const UserQuery = `SELECT password FROM users WHERE username = ?`
        const [Result] = await Database.execute<any[]>(UserQuery, [username])

        if (Result[0]) {
            if (Result[0].password == password) {
                req.session.user = username
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