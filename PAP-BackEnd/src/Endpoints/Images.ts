import multer from 'multer'
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import path from 'path'
import fs from 'fs'
import { promises as fsp } from 'fs';
import sharp from 'sharp'


const UploadsFolder = path.join(__dirname, "../Uploads")
const UsersFolder = UploadsFolder + '/users/'
const MenuFolder = UploadsFolder + '/menu/'

// STORAGE SETUP

// USERS
const UserImagesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UsersFolder);
    },
    filename: (req, file, cb) => {
        const Extension = path.extname(file.originalname);
        cb(null, req.session.user + Extension)
    }
});

// MENU ITEMS
const MenuImagesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, MenuFolder);
    },
    filename: (req, file, cb) => {
        const Ext = path.extname(file.originalname)
        cb(null, req.body.name + Ext)
    }
});


const UserImages = multer({ storage: UserImagesStorage });
const MenuImages = multer({ storage: MenuImagesStorage });



const Extensions = ['.jpg', '.jpeg', '.png', '.webp'];
function FindImage(Folder: string, Name: string, Response: ExpressResponse): string | undefined {

    for (const ext of Extensions) {
        const FilePath = path.join(Folder, `${Name}${ext}`);
        const Exists = fs.existsSync(FilePath)

        if (Exists) {
            Response.sendFile(FilePath)
            return FilePath
        }
    }


    Response.status(404).send()
}

/**
 * @displayname "Images"
 * @path /images/*
 * @method GET
 * @summary "Views an uploaded image
 * @unprotected true
 */
Router.get("/images/users/:user", (Request, Response) => {
    const user = Request.params.user
    const FilePath = path.join(UsersFolder, `${user}.webp`);
    if (fs.existsSync(FilePath)) {
        Response.sendFile(FilePath)
    } else {
        Response.status(404).send()
    }
})

Router.get("/images/menu/:product", (Request, Response) => {
    const product = Request.params.product
    const FilePath = path.join(MenuFolder, `${product}.webp`);
    if (fs.existsSync(FilePath)) {
        Response.sendFile(FilePath)
    } else {
        Response.status(404).send()
    }
})



/**
 * @displayname "User Images"
 * @path /images/users
 * @method POST
 * @summary "Change user images"
 * @unprotected true
 */
Router.post('/images/users', UserImages.single('image'), HandleEndpointFunction(async (req, res) => {
    if (!req.file) {
        res.status(400).send({ error: 'No file uploaded' });
        return
    }

    const FilePath = req.file.path
    const webpPath = FilePath.replace(/\.[^/.]+$/, '.webp');
    const tempPath = webpPath + '-temp';

    await sharp(FilePath)
        .resize(600, 600)
        .webp()
        .toFile(tempPath);

    await fsp.rename(tempPath, webpPath);

    if (FilePath !== webpPath) {
        await fsp.unlink(FilePath);
    }


    res.json({ sucess: true });
}))



/**
 * @displayname "Menu Items"
 * @path /images/menu
 * @method POST
 * @summary "Create/Delete items on the menu"
 */
Router.post('/images/menu', MenuImages.single('image'), HandleEndpointFunction(async (req, res) => {
    if (!req.file) {
        res.status(400).send({ error: 'No file uploaded' });
        return
    }

    const FilePath = req.file.path
    const webpPath = FilePath.replace(/\.[^/.]+$/, '.webp');
    const tempPath = webpPath + '-temp';

    await sharp(FilePath)
        .resize(300, 300)
        .webp()
        .toFile(tempPath);

    await fsp.rename(tempPath, webpPath);

    if (FilePath !== webpPath) {
        await fsp.unlink(FilePath);
    }


    res.json({ sucess: true });
}))


module.exports = Router;