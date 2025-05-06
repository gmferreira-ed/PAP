import express from 'express'
import PermissionsService from '../Services/PermissionsService'
import { Database, HandleEndpointFunction } from '../Globals'


const router = express.Router();

import SQLUtils from '../Services/SQLUtils'


/**
 * @displayname "Role Permissions"
 * @path /permissions
 * @method GET
 * @summary "Fetches all endpoint permissions"
 * @unprotected true
 */
router.get('/role-permissions', HandleEndpointFunction(async function(request, response){
    const Permissions = await PermissionsService.EndpointsData.Get()
    response.send(Permissions)
}))


/**
 * @displayname "Role Permissions"
 * @path /endpoint-permissions
 * @method POST
 * @summary "Binds a permission level to an endpoint"
 */
router.post('/role-permissions', HandleEndpointFunction(async function(request, response){
    const requestData = request.body 

    var [SQLQuery, Values] = SQLUtils.BuildInsertQuery('role_permissions', [
        'endpoint',
        'method',
        'role',
    ], requestData)


    const [rows] = await Database.execute(SQLQuery, Values)
    PermissionsService.EndpointsData.ResetExpiration()

    response.send({success:true})
}))



/**
 * @displayname "Role Permissions"
 * @path /endpoint-permissions
 * @type_label "UPDATE" // Technically, it is CREATE, however for an user view it can look like PATCH, therefore its better to attribute the name manually
 * @method DELETE
 * @summary "Change permissions of a role"
 */
router.delete('/role-permissions', HandleEndpointFunction(async function(request, response){
    const requestData = request.body 

    var [SQLQuery, Values] = SQLUtils.BuildDeleteQuery('role_permissions', 
        requestData, 
        ["endpoint", "method", "role"]
    )


    const [Result] = await Database.execute(SQLQuery, Values)
    PermissionsService.EndpointsData.ResetExpiration()

    response.send({success:true})
}))

module.exports = router;