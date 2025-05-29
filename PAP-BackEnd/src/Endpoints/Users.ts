
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetPaginatedResult } from '../Globals'
import SQLUtils from '../Services/SQLUtils';


/**
 * @displayname "Users"
 * @path /users
 * @method GET
 * @summary "View all users and their info"
 */
Router.get('/users', HandleEndpointFunction(async (req, res) => {
    const query = req.query
    const targetuser = query.user

    if (!targetuser) {
        // Paginated users
        const page = parseInt(query.page as string) || 1
        let pagesize = parseInt(query.pagesize as string) || 5

        pagesize = Math.min(pagesize, 50)

        const [UsersQuery] = SQLUtils.BuildSelectQuery('users', {}, [])

        var result = await GetPaginatedResult("users",UsersQuery,[], page, pagesize)
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

module.exports = Router