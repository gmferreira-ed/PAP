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

    const Values: any = [Query.StartDate]
    var ReservationsQuery = 'SELECT * FROM reservations '

    if (Query.EndDate && Query.EndDate != 'undefined') {
        ReservationsQuery += ' WHERE DATE(`date`) BETWEEN DATE(?) AND DATE(?)';
        Values.push(Query.EndDate)
    } else if (Query.StartDate) {
        ReservationsQuery += 'WHERE DATE(?) = DATE(`date`)'
    }
    ReservationsQuery += `ORDER BY date ASC`


    const [Reservations] = await Database.execute<any>(ReservationsQuery, Values)

    res.send(Reservations)

}));

/**
 * @displayname "Add Reservation"
 * @category "Reservations"
 * @summary "Create a new reservation"
 * @path /reservations
 * @method POST
 */
Router.post('/reservations', HandleEndpointFunction(async (req, res) => {

    const Body = req.body
    Body.creator_id = req.session.userid

    const [ReservationQuery, Values] = SQLUtils.BuildInsertQuery('reservations', [
        'tableid',
        'creator_id',
        'date',
        'name',
        'email',
        'phone',
        'guest_count',
        'reservation_time',
        'notes',
    ], Body)

    const [Result] = await Database.execute(ReservationQuery, Values)

    res.send()

}));

/**
 * @displayname "Update Reservation"
 * @category "Reservations"
 * @summary "Change reservation information"
 * @path /reservations
 * @method PATCH
 */
Router.patch('/reservations', HandleEndpointFunction(async (req, res) => {



}));


/**
 * @displayname "Delete Reservation"
 * @category "Reservations"
 * @summary "Delete a reservation"
 * @path /reservations
 * @method DELETE
 */
Router.delete('/reservations', HandleEndpointFunction(async (Request, Response) => {

    const DeleteQuery = 'DELETE FROM reservations WHERE id=?'
    const [DeleteResult] = await Database.execute(DeleteQuery, [Request.body.reservation_id])

    Response.send()
}))


module.exports = Router