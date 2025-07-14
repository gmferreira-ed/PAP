import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetPaginatedResult } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import axios from 'axios';
import sharp from 'sharp'
import path from 'path'
import bcrypt from 'bcrypt'
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
 * @displayname "Create/Modify Users"
 * @category "Users"
 * @summary "Create new user accounts and modify existing user information"
 * @path /users
 * @method POST
 */
Router.post('/users', HandleEndpointFunction(async (req, res) => {
    const UserInfo = req.body;
    UserInfo.verified = 1
    UserInfo.active = 1
    UserInfo.password = await HashPassword(UserInfo.password)
    
    try {
        const [UserCreateQuery, Values] = SQLUtils.BuildInsertQuery('users', [
            'username', 'email', 'phone', 'fullname', 'birthdate', 'country', 'city', 'address', 'postalcode', 'password', 'role', 'verified', 'active'
        ], UserInfo);
        const [CreateResult] = await Database.execute(UserCreateQuery, Values) as any

        res.send({ success: true, userid: CreateResult.insertId });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
            if (err.sqlMessage.includes('email')) {
                res.status(401).send({ error: "This email is already in use" });
            } else if (err.sqlMessage.includes('phone')) {
                res.status(401).send({ error: "This phone is already in use" });
            } else if (err.sqlMessage.includes('username')) {
                res.status(401).send({ error: "This username is already in use" });
            } else {
                res.status(502).send({ error: "Unknown error" });
            }
        } else {
            throw err
        }
    }
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



const saltRounds = 10
async function HashPassword(ClientPassword:string) {
  const hashedPassword = await bcrypt.hash(ClientPassword, saltRounds);
  return hashedPassword;
}





const UsersFolder = path.join(__dirname, "../Uploads/users/");


// //Generates random users
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

// async function RegenerateUserImages() {
//     console.log('Starting to regenerate user images...');
    
//     // Get all users from database
//     const [users] = await Database.execute<any[]>('SELECT username, fullname FROM users');
    
//     for (const user of users) {
//         const webpPath = path.join(UsersFolder, `${user.username}.webp`);
        
//         // Check if image already exists
//         if (fs.existsSync(webpPath)) {
//             console.log(`Image already exists for ${user.username}, skipping...`);
//             continue;
//         }
        
//         try {
//             console.log(`Downloading image for ${user.username}...`);
            
//             // Try to get a random user image
//             const { data } = await axios.get('https://randomuser.me/api/');
//             const randomUser = data.results[0];
            
//             const pictureUrl = randomUser.picture.large;
//             const imageResp = await axios.get(pictureUrl, { responseType: 'arraybuffer' });
//             const imageBuffer = Buffer.from(imageResp.data, 'binary');
            
//             // Ensure users folder exists
//             if (!fs.existsSync(UsersFolder)) {
//                 fs.mkdirSync(UsersFolder, { recursive: true });
//             }
            
//             await sharp(imageBuffer)
//                 .resize(600, 600)
//                 .webp()
//                 .toFile(webpPath);
                
//             console.log(`Successfully downloaded image for ${user.username}`);
            
//             // Add delay to avoid hitting API rate limits
//             await new Promise(resolve => setTimeout(resolve, 500));
            
//         } catch (err) {
//             console.error(`Failed to download image for ${user.username}:`, err);
//         }
//     }
    
//     console.log('Finished regenerating user images!');
// }

// RegenerateUserImages();


// async function convertUserImagesToWebP() {
//     console.log('Starting to convert user images to WebP...');
    
//     // Ensure users folder exists
//     if (!fs.existsSync(UsersFolder)) {
//         console.log('Users folder does not exist, creating it...');
//         fs.mkdirSync(UsersFolder, { recursive: true });
//         return;
//     }
    
//     // Get all files in the users folder
//     const files = fs.readdirSync(UsersFolder);
    
//     // Filter for image files (common formats)
//     const imageFiles = files.filter(file => {
//         const ext = path.extname(file).toLowerCase();
//         return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'].includes(ext);
//     });
    
//     console.log(`Found ${imageFiles.length} image files to process`);
    
//     for (const file of imageFiles) {
//         const filePath = path.join(UsersFolder, file);
//         const fileName = path.parse(file).name;
//         const webpPath = path.join(UsersFolder, `${fileName}.webp`);
        
//         try {
//             // Check if it's already a WebP file
//             if (path.extname(file).toLowerCase() === '.webp') {
//                 // console.log(`Checking WebP file: ${file}`);
                
//                 // Check if WebP file needs resizing
//                 const metadata = await sharp(filePath).metadata();
//                 if (metadata.width !== 600 || metadata.height !== 600) {
//                     await sharp(filePath)
//                         .resize(600, 600)
//                         .webp()
//                         .toFile(webpPath + '.tmp');
                    
//                     // Replace original file
//                     fs.renameSync(webpPath + '.tmp', webpPath);
//                 } else {
//                     // console.log(`WebP file ${file} already correctly sized, skipping...`);
//                 }
//             } else {
//                 console.log(`Converting ${file} to WebP...`);
                
//                 // Convert to WebP and resize
//                 await sharp(filePath)
//                     .resize(600, 600)
//                     .webp()
//                     .toFile(webpPath);
                
//                 // Remove original file after successful conversion
//                 fs.unlinkSync(filePath);
//                 console.log(`Successfully converted ${file} to ${fileName}.webp`);
//             }
            
//         } catch (err) {
//             console.error(`Failed to process ${file}:`, err);
//         }
//     }
    
//     console.log('Finished converting user images to WebP!');
// }

// // Run the script
// convertUserImagesToWebP().catch(console.error);


module.exports = Router