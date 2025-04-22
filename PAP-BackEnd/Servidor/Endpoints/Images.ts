
import multer from 'multer'
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals.ts'

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


// Image GET
Router.use("/images", express.static('Server/images'))


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