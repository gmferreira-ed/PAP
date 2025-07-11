import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetPaginatedResult } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import axios from 'axios';
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import PermissionsService from '../Services/PermissionsService';


const UserQuery = `SELECT userid,username,active,fullname,
    role,birthdate, card_id, created, verified 
    FROM users `

const SensitiveUserQuery = `SELECT userid,username,active,email,phone,fullname,
    role,birthdate, country, city, address, postalcode, card_id, created, verified 
    FROM users `

/**
 * @displayname "View Users"
 * @category "Users"
 * @path /users
 * @method GET
 * @summary "View all users and their info. Only administrators may view addresses"
 */
Router.get('/users', HandleEndpointFunction(async (req, res) => {
    const query = req.query
    const targetuser = query.user

    const ClientData = await PermissionsService.GetUserData(req.session.user!)
    const TargetQuery = (ClientData.administrator || req.session.user == targetuser) ? SensitiveUserQuery : UserQuery

    var result = await GetPaginatedResult("users", TargetQuery, [], query)
    res.send(result)

}))


/**
 * @displayname "View User by Username"
 * @category "Users"
 * @path /users/user
 * @method GET
 * @summary "View specific user information by username. Only administrators may view sensitive info"
 * @unprotected true
 */
Router.get('/users/user', HandleEndpointFunction(async (req, res) => {

    const targetuser = req.query.user
    
    const ClientData = await PermissionsService.GetUserData(req.session.user!)
    let TargetQuery = (ClientData.administrator || req.session.user == targetuser) ? SensitiveUserQuery : UserQuery
    TargetQuery+='WHERE username=?'

    const [UserInfo] = await Database.execute<any[]>(TargetQuery, [targetuser])

    res.send(UserInfo[0])
}))


/**
 * @displayname "Edit Users"
 * @category "Users"
 * @summary "Edit other users information"
 * @path /users
 * @method PATCH
 * @connected POST/api/users
 */
Router.patch('/users', HandleEndpointFunction(async (req, res) => {
    const userid = req.body.userid

    const [UpdateQuery, Values] = SQLUtils.BuildUpdateQuery('users', ['active', 'role', 'email', 'phone'], req.body, ['userid'], true)
    const [UpdateResult] = await Database.execute(UpdateQuery, Values)

    res.send()
}))


/**
 * @displayname "Set User Keycard"
 * @category "Users"
 * @summary "Assign a keycard to a user"
 * @path /users/keycard
 * @method POST
 * @connected POST/api/users
 */
Router.post('/users/keycard', HandleEndpointFunction(async (req, res) => {
    const UserID = req.body.userid
    const CardID = req.body.card_id
    try {
        const CardSetQuery = `UPDATE users SET card_id=? WHERE userid=?`;
        const [CardSetResult] = await Database.execute(CardSetQuery, [CardID, UserID]);
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
            res.status(401).send({ error: "Already connected to another user" });
        } else {
            throw err
        }
    }

    res.send()
}))

/**
 * @displayname "Remove User Keycard"
 * @category "Users"
 * @summary "Remove a user's keycard"
 * @path /users/keycard
 * @method DELETE
 * @connected POST/api/users
 */
Router.delete('/users/keycard', HandleEndpointFunction(async (req, res) => {
    const UserID = req.body.userid

    const CardRemoveQuery = `UPDATE users SET card_id=NULL WHERE userid=?`
    const [CardRemoveResult] = await Database.execute(CardRemoveQuery, [UserID])

    res.send()
}))

/**
 * @displayname "Create/Modify Users"
 * @category "Users"
 * @summary "Create new user accounts and modify existing user information"
 * @path /users
 * @method POST
 */
Router.post('/users', HandleEndpointFunction(async (req, res) => {
    const user = req.session.user;
    const UserInfo = req.body;

    const [UserCreateQuery, Values] = SQLUtils.BuildInsertQuery('users', [
        'username', 'email', 'phone', 'fullname', 'birthdate', 'country', 'city', 'address', 'postalcode', 'password', 'role'
    ], UserInfo);
    await Database.execute(UserCreateQuery, Values);

    res.send({ success: true });
}))




// Generates random users
// const UsersFolder = path.join(__dirname, "../Uploads/users/");

// async function GenerateRandomUser(role: string = 'user') {
//     const { data } = await axios.get('https://randomuser.me/api/');
//     const user = data.results[0];

//     const first = user.name.first.toLowerCase();
//     const last = user.name.last.toLowerCase();
//     const username = (first[0] + last).replace(/[0-9]/g, '');

//     const HasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(username)
//     if (!HasArabic) {
//         console.log(username)
//         try {
//             const pictureUrl = user.picture.large;
//             const imageResp = await axios.get(pictureUrl, { responseType: 'arraybuffer' });
//             const imageBuffer = Buffer.from(imageResp.data, 'binary');
//             const webpPath = path.join(UsersFolder, `${username}.webp`);
//             await sharp(imageBuffer)
//                 .resize(600, 600)
//                 .webp()
//                 .toFile(webpPath);
//         } catch (err) {
//             console.error('Failed to process user image:', err);
//         }

//         const newUser = {
//             username: username,
//             email: user.email,
//             phone: String(user.phone).replace(/[^0-9+]/g, '').slice(0, 20),
//             fullname: `${user.name.first} ${user.name.last}`,
//             birthdate: user.dob.date.split('T')[0],
//             country: user.location.country,
//             city: user.location.city,
//             address: `${user.location.street.number} ${user.location.street.name}`,
//             postalcode: String(user.location.postcode),
//             password: user.login.password,
//             role: role
//         };

//         const [UserCreateQuery, Values] = SQLUtils.BuildInsertQuery('users', [
//             'username', 'email', 'phone', 'fullname', 'birthdate', 'country', 'city', 'address', 'postalcode', 'password', 'role'
//         ], newUser);
//         await Database.execute(UserCreateQuery, Values);
//     }
// }

// async function GenerateUsers(intervalMs = 1000) {
//     while (true) {
//         await GenerateRandomUser();
//         await new Promise(resolve => setTimeout(resolve, intervalMs));
//     }
// }

// GenerateUsers();





module.exports = Router