
import multer from 'multer'
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import path from 'path';
import  fs  from 'fs';


const UploadsFolder = path.join(__dirname, "../Uploads")

// STORAGE SETUP
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Server/images/menu-thumbnails');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname); // Unique filename
    }
});
const upload = multer({ storage });

/**
 * @displayname "Images"
 * @path /images/*
 * @method GET
 * @summary "Views an uploaded image
 * @unprotected true
 */
const UsersFolder = UploadsFolder+'/users/'
const Extensions = ['.jpg', '.jpeg', '.png', '.webp'];

console.log(UsersFolder)
Router.get("/images/users/:user", (Request, Response) => {
    const user = Request.params.user
    
    for (const ext of Extensions) {
        const caminho = path.join(UsersFolder, `${user}${ext}`);
        const Existe = fs.existsSync(caminho)

        if (Existe) {
            Response.sendFile(caminho);
            return
        }
    }

    Response.status(404).send('Image not found');
})


// Image MENU POST
Router.post('/images/menu-thumbnails', upload.single('thumbnail'), HandleEndpointFunction(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const FileName = req.file.filename
        const FileUrl = `http://localhost:3000/images/menu-thumbnails/${FileName}`
        res.json({ url: FileUrl, filename: FileName });

    } catch (err: any) {
        console.warn(err);

        res.status(500).json({ error: err.message });
    }
}))

module.exports = Router;