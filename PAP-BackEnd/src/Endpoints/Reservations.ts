
import express from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';



/**
 * @displayname "Reservations"
 * @path /reservations
 * @method GET
 * @summary "View reservations"
 * @unprotected true
 */
Router.get('/reservations', HandleEndpointFunction(async (req, res) => {

    const Query = req.query

    const Limit = Query.Limit ? Math.min(Number(Query.Limit), 250) : 250

    const [ReservationsQuery , Values] = SQLUtils.BuildSelectQuery('reservations', Query, [], Limit)

    const [Reservations] = await Database.execute<any>(ReservationsQuery, Values)

    res.send(Reservations)

}));

/**
 * @displayname "reservations"
 * @path /reservations
 * @method POST
 * @summary "Create/Cancel reservations"
 */
Router.post('/reservations',  HandleEndpointFunction(async (req, res) => {

    const Body = req.body
    Body.creator_id = req.session.user

    const [ReservationQuery, Values] = SQLUtils.BuildInsertQuery('reservations', [
        'tableid',
        'creator_id',
        'name',
        'email',
        'phone',
        'guest_count',
        'reservation_time',
        'notes',
    ], Body)

    res.send()

}));

/**
 * @displayname "Reservations"
 * @path /reservations
 * @method PATCH
 * @summary "Change reservations info"
 */
Router.patch('/reservations', HandleEndpointFunction(async (req, res) => {
    


}));


/**
 * @displayname "reservations"
 * @path /reservations
 * @method DELETE
 * @summary "Create/Cancel reservations"
 */
Router.delete('/reservations', HandleEndpointFunction(async (Request, Response) => {


}))


module.exports = Router