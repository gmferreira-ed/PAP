import express from 'express'
import PermissionsService from '../Services/PermissionsService'
import { Database, GetPaginatedResult, HandleEndpointFunction } from '../Globals'


const router = express.Router();

import SQLUtils from '../Services/SQLUtils'


/**
 * @displayname "Role Permissions"
 * @path /role-permissions
 * @method GET
 * @summary "Fetches all role permissions"
 * @unprotected true
 */
router.get('/role-permissions', HandleEndpointFunction(async function (request, response) {
    const Permissions = await PermissionsService.EndpointsData.Get()
    response.send(Permissions)
}))

/**
 * @displayname "User Role Permissions"
 * @path /role-permissions/user
 * @method GET
 * @summary "Fetches user role permissions"
 * @unprotected true
 */
router.get('/role-permissions/user', HandleEndpointFunction(async function (request, response) {
    const User = request.session.user

    if (User){
        const UserPermissions = await PermissionsService.GetUserPermissions(User)
        response.send(UserPermissions)
    }else{
        response.status(404).send({error: 'User not found'})
    }
}))





/**
 * @displayname "Roles"
 * @path /roles
 * @method GET
 * @summary "Fetches all roles"
 * @unprotected true
 */
router.get('/roles', HandleEndpointFunction(async function (request, response) {

    var SQLQuery = `SELECT * FROM roles order by permission_level`

    const [Roles] = await Database.query(SQLQuery); 

    response.send(Roles)
}))



/**
 * @displayname "Role Users"
 * @path /role-users
 * @method GET
 * @summary "Gets all users with a certain role"
 * @unprotected true
 */
router.get('/role-users', HandleEndpointFunction(async function (request, response) {

    const Query = request.query
    const [UsersQuery, UsersQueryValues] = SQLUtils.BuildSelectQuery('users', Query, ['role'])

    var Result = await GetPaginatedResult("users", UsersQuery, UsersQueryValues, Query)
    response.send(Result)
}))


/**
 * @displayname "Role Permissions"
 * @path /role-permissions
 * @method POST
 * @summary "Binds a permission level to an endpoint"
 */
router.post('/role-permissions', HandleEndpointFunction(async function (request, response) {
    const requestData = request.body

    var [SQLQuery, Values] = SQLUtils.BuildInsertQuery('role_permissions', [
        'endpoint',
        'method',
        'role',
    ], requestData)


    const [rows] = await Database.execute(SQLQuery, Values)
    PermissionsService.EndpointsData.ResetExpiration()

    response.send({ success: true })
}))



/**
 * @displayname "Role Permissions"
 * @path /role-permissions
 * @type_label "UPDATE" // Technically, it is CREATE, however for an user view it can look like PATCH, therefore its better to attribute the name manually
 * @method DELETE
 * @summary "Change permissions of a role"
 */
router.delete('/role-permissions', HandleEndpointFunction(async function (request, response) {
    const requestData = request.body

    var [SQLQuery, Values] = SQLUtils.BuildDeleteQuery('role_permissions',
        requestData,
        ["endpoint", "method", "role"]
    )


    const [Result] = await Database.execute(SQLQuery, Values)
    PermissionsService.EndpointsData.ResetExpiration()

    response.send({ success: true })
}))

module.exports = router;