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

    if (User) {
        const UserPermissions = await PermissionsService.GetUserData(User)
        response.send(UserPermissions)
    } else {
        response.status(404).send({ error: 'User not found' })
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
 * @displayname "Create/Delete Roles"
 * @category "Permissions"
 * @path /roles
 * @method POST
 * @summary "Create or delete roles"
 */
router.post('/roles', HandleEndpointFunction(async function (request, response) {
    const requestData = request.body


    var SQLQuery = `UPDATE roles SET permission_level = permission_level + 
    1  WHERE permission_level >= ?`
    const [result] = await Database.execute(SQLQuery, [requestData.permission_level]);


    var SQLQuery = `INSERT INTO roles (permission_level , name) 
    VALUES (?, ?)`

    const [Result] = await Database.execute(SQLQuery, [requestData.permission_level, requestData.name])
    PermissionsService.EndpointsData.ResetExpiration()

    response.send(Result)
}))


/**
 * @displayname "Create/Delete Roles"
 * @category "Permissions"
 * @path /roles
 * @method DELETE
 * @summary "Create or delete roles"
 * @connected POST/api/roles
 */
router.delete('/roles', HandleEndpointFunction(async function (request, response) {
    const requestData = request.body;


    const [RoleInfo] = await Database.query(
        `SELECT permission_level FROM roles WHERE name = ?`, [requestData.name]
    ) as any[]

    if (RoleInfo.length === 0) {
        return response.status(404).send({ error: 'Permission not found' })
    }

    const RolePermLevel = RoleInfo[0].permission_level

    await Database.execute(
        `DELETE FROM roles WHERE name = ?`, [requestData.name]
    );

    await Database.query(
        `UPDATE roles SET permission_level = permission_level - 1 WHERE permission_level > ${RolePermLevel}`
    );

    PermissionsService.EndpointsData.ResetExpiration()
    response.send({ success: true });
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
 * @displayname "Change Permissions"
 * @category "Permissions"
 * @summary "Change permissions linked to a certain role"
 * @path /role-permissions
 * @method POST
 */
router.post('/role-permissions', HandleEndpointFunction(async function (request, response) {
    const requestData = request.body

    var [SQLQuery, Values] = SQLUtils.BuildInsertQuery('role_permissions', [
        'endpoint_id',
        'role',
    ], requestData)


    const [rows] = await Database.execute(SQLQuery, Values)
    PermissionsService.EndpointsData.ResetExpiration()

    response.send({ success: true })
}))



/**
 * @displayname "Change Role Permission"
 * @category "Permissions"
 * @summary "Change permissions of a role"
 * @path /role-permissions
 * @method DELETE
 * @connected POST/api/role-permissions
 */
router.delete('/role-permissions', HandleEndpointFunction(async function (request, response) {
    const requestData = request.body

    var [SQLQuery, Values] = SQLUtils.BuildDeleteQuery('role_permissions',
        requestData,
        ["endpoint_id", "role"]
    )

    const [Result] = await Database.execute(SQLQuery, Values)
    PermissionsService.EndpointsData.ResetExpiration()

    response.send({ success: true })
}))

module.exports = router;