import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetPaginatedResult } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import { ExpressWebSocketServer } from '../Types/websocket';


async function GetEntries(req:ExpressRequest, res:ExpressResponse, UserID?:number) {
    const RequestQueryValues:any = {
        ...req.query
    }
    if (UserID){
        RequestQueryValues.userid = UserID
    }
    const [InitialEntriesQuery, InitialEntriesValues] = SQLUtils.BuildSelectQuery('attendance',
        req.query,
        ['attendance.userid'],
        ['attendance.entryid', 'attendance.userid', 'attendance.action', 'attendance.timestamp', 'users.fullname', 'users.username'],
        'JOIN users ON attendance.userid = users.userid  ', ' ORDER BY timestamp DESC', UserID!=undefined
    )

    let Entries
    if (req.query.page) {
        Entries = await GetPaginatedResult('attendance', InitialEntriesQuery, InitialEntriesValues, req.query, undefined, ' ORDER BY timestamp DESC')
    } else {
        [Entries] = await Database.execute(InitialEntriesQuery, InitialEntriesValues)
    }

    res.send(Entries)
}

const EntriesWebsocket = new ExpressWebSocketServer('/entries')
/**
 * @displayname "View Entries"
 * @category "Entries"
 * @summary "View employees entries in the restaurant"
 * @path /entries
 * @method GET
 */
Router.get('/entries', HandleEndpointFunction(async (req, res) => {
    GetEntries(req, res)
}));

/**
 * @displayname "View User Entries"
 * @category "Entries"
 * @summary "View own user entries"
 * @path /entries/user
 * @method GET
 * @unprotected true
 */
Router.get('/entries/user', HandleEndpointFunction(async (req, res) => {
    GetEntries(req, res, req.session.userid)
}));



/**
 * @displayname "Register Entry"
 * @category "Entries"
 * @summary "Allows the application to register keycard entries while users with this role are logged in."
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

    if (User) {
        const LastEntryQuery = `SELECT action FROM attendance WHERE userid = ? ORDER BY timestamp DESC LIMIT 1`
        const [EntryResult] = await Database.execute<any>(LastEntryQuery, [UserInfo.userid])
        const LastEntry = EntryResult[0]

        const ActionType = !LastEntry || LastEntry.action == 'exit' ? 'entry' : 'exit'
        IsEntry = ActionType == 'entry'

        const InsertQuery = `INSERT INTO attendance (userid, action) VALUES(?,?)`
        const [InsertResult] = await Database.execute(InsertQuery, [UserInfo.userid, ActionType])

        EntriesWebsocket.SendGlobalMessage(ActionType, UserInfo)
    }
    res.send({ user: User, is_entry: IsEntry })
}));



// Clean up attendance
// Database.query('SELECT * FROM attendance ORDER BY timestamp ASC').then((Data: any[]) => {
//   const Entries = Data[0]

//   const LastActions: Record<number, string> = {}

//   for (const Entry of Entries) {
//     const Action = Entry.action
//     const LastAction = LastActions[Entry.userid]

//     console.log(Action)
//     if (LastAction == Action) {
//       console.log(Entry.entryid)
//     }

//     LastActions[Entry.userid] = Action
//   }
// })


module.exports = Router