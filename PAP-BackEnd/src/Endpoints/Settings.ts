import express from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';



/**
 * @displayname "View Settings"
 * @category "Settings"
 * @path /settings
 * @method GET
 * @summary "View restaurant configuration settings"
 * @unprotected true
 * @root true
 */
Router.get('/settings', HandleEndpointFunction(async (req, res) => {

    var SettingsQuery = `SELECT * FROM settings`

    const [Settings] = await Database.query<any>(SettingsQuery);

    // Send all settings fields, including new ones
    res.send(Settings[0])
}));

/**
 * @displayname "Update Settings"
 * @category "Settings"
 * @path /settings
 * @method PATCH
 * @summary "Modify restaurant settings such as work hours, pay per hour, contact info, etc."
 */
Router.patch('/settings', HandleEndpointFunction(async (req, res) => {

    const [UpdateQuery, Values] = SQLUtils.BuildUpdateQuery('settings', [
        'Currency',
        'WorkHours',
        'WorkHourLimit',
        'PayPerHour',
        'MealAllowance',
        'ExtraPay',
        'ExtraPayMinuteRate',
        'City',
        'Contact',
        'TaxID',
        'Adress',
        'RestaurantName',
        'PostalCode'
    ], req.body, [])

    const [Sucess] = await Database.execute(UpdateQuery, Values)

    res.send({sucess:true})
}));



module.exports = Router