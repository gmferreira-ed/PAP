
import multer from 'multer'
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'



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
 * @openapi
 * /images/{image}:
 *   get:
 *     summary: Get an image by filename/path
 *     description: This endpoint allows you to upload a menu thumbnail image and retrieve its URL.
 *     tags:
 *       - Images
 *     responses:
 *       200:
 *         description: Image
 *         content: Image
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
Router.use("/images", express.static('Server/images'))


/**
 * @openapi
 * /images/menu-thumbnails:
 *   post:
 *     summary: Upload a menu thumbnail image
 *     description: This endpoint allows you to upload a menu thumbnail image and retrieve its URL.
 *     operationId: uploadMenuThumbnail
 *     tags:
 *       - Images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 * 
 *     responses:
 *       200:
 *         description: Image URL and filename
 *         content:
 *           
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */

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