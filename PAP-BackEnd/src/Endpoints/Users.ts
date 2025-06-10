
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetPaginatedResult } from '../Globals'
import SQLUtils from '../Services/SQLUtils';


/**
 * @displayname "Users"
 * @path /users
 * @method GET
 * @summary "View all users and their info"
 * @unprotected true
 */
Router.get('/users', HandleEndpointFunction(async (req, res) => {
    const query = req.query
    const targetuser = query.user

    if (!targetuser) {
        // Paginated users

        const [UsersQuery] = SQLUtils.BuildSelectQuery('users', {}, [])

        var result = await GetPaginatedResult("users",UsersQuery,[], query)
        res.send(result)
    } else {
        const UserQuery = `SELECT * FROM users WHERE username=?`
        const [UserInfo] = await Database.execute<any[]>(UserQuery, [targetuser])

        res.send(UserInfo[0])
    }
}))


Router.get('/users/:user', HandleEndpointFunction(async (req, res) => {

    const targetuser = req.params.user

    const UserQuery = `SELECT * FROM users WHERE username=?`
    const [UserInfo] = await Database.execute<any[]>(UserQuery, [targetuser])

    res.send(UserInfo[0])
}))

/**
 * @displayname "Users"
 * @path /users
 * @method PATCH
 * @summary "Edit user info"
 */
Router.patch('/users', HandleEndpointFunction(async (req, res) => {
    const userid = req.body.userid

    const [UpdateQuery, Values] = SQLUtils.BuildUpdateQuery('users', ['active'], req.body, ['userid'])
    const [UpdateResult] = await Database.execute(UpdateQuery, Values)

    res.send()
}))


/**
 * @displayname "User Keycard"
 * @path /users/keycard
 * @method POST
 * @summary ""
 */
Router.post('/users/keycard', HandleEndpointFunction(async (req, res) => {
    const UserID = req.body.userid
    const CardID = req.body.card_id

    const CardSetQuery = `UPDATE users SET card_id=? WHERE userid=?`
    const [CardSetResult] = await Database.execute(CardSetQuery, [CardID, UserID])

    res.send()
}))

/**
 * @displayname "User Keycard"
 * @path /users/keycard
 * @method DELETE
 * @summary ""
 */
Router.delete('/users/keycard', HandleEndpointFunction(async (req, res) => {
    const UserID = req.body.userid

    const CardRemoveQuery = `UPDATE users SET card_id=NULL WHERE userid=?`
    const [CardRemoveResult] = await Database.execute(CardRemoveQuery, [UserID])

    res.send()
}))

module.exports = Router