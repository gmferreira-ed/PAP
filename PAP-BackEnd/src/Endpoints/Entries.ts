import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetPaginatedResult } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import { ExpressWebSocketServer } from '../Types/websocket';


const EntriesWebsocket = new ExpressWebSocketServer('/entries')
/**
 * @displayname "View Entries"
 * @category "Entries"
 * @summary "View employees entries in the restaurant"
 * @path /entries
 * @method GET
 */
Router.get('/entries', HandleEndpointFunction(async (req, res) => {
    const [InitialEntriesQuery, InitialEntriesValues] = SQLUtils.BuildSelectQuery('attendance', 
        req.query,
        ['attendance.userid'],
        ['attendance.entryid', 'attendance.userid', 'attendance.action', 'attendance.timestamp', 'users.fullname', 'users.username'],
        'JOIN users ON attendance.userid = users.userid  '
    )

    console.log(InitialEntriesQuery)
    const Entries  = await GetPaginatedResult('attendance', InitialEntriesQuery, InitialEntriesValues, req.query, undefined, ' ORDER BY timestamp DESC')
    
    res.send(Entries.Rows)
}));


/**
 * @displayname "Register Entry"
 * @category "Entries"
 * @summary "Register an employee entry or exit using keycard"
 * @path /entries
 * @method POST
 */
Router.post('/entries', HandleEndpointFunction(async (req, res) => {
    const CardID = req.body.card_id

    const UserSearch = `SELECT fullname, userid FROM users WHERE card_id=?`
    const [Result] = await Database.execute<any>(UserSearch, [CardID])

    const UserInfo = Result[0]
    const User = UserInfo?.fullname
    let IsEntry = true

    if (User){
        const LastEntryQuery = `SELECT action FROM attendance WHERE userid = ? ORDER BY timestamp DESC LIMIT 1`
        const [EntryResult] = await Database.execute<any>(LastEntryQuery, [UserInfo.userid])
        const LastEntry = EntryResult[0]

        const ActionType = !LastEntry || LastEntry.action == 'exit' ? 'entry' : 'exit'
        IsEntry = ActionType == 'entry'

        const InsertQuery = `INSERT INTO attendance (userid, action) VALUES(?,?)`
        const [InsertResult] = await Database.execute(InsertQuery, [UserInfo.userid, ActionType])

        EntriesWebsocket.SendGlobalMessage(ActionType, UserInfo)
    }
    res.send({user:User, is_entry:IsEntry})
}));


module.exports = Router