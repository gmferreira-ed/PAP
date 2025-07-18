import express from 'express'
import multer from 'multer'
const Router = express.Router();
import { Database, HandleEndpointFunction } from '../Globals'
import SQLUtils from '../Services/SQLUtils';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';



/**
 * @displayname "View Menu"
 * @category "Menu"
 * @path /menu
 * @method GET
 * @summary "View all menu items with categories and stock information"
 * @unprotected true
 */
Router.get('/menu', HandleEndpointFunction(async (req, res) => {

    const query = req.query

    var SQLQuery = `SELECT menu.*, catg.name as category FROM menu 
    LEFT JOIN  menu_categories catg ON catg.id = menu.category_id
     LEFT JOIN  stock_items stockitem ON stockitem.connected_product_id = menu.id
     ORDER  BY \`order\` ASC
    `
    const [MenuItems] = await Database.execute(SQLQuery);


    res.send(MenuItems)

}));

/**
 * @displayname "Create/Modify Menu Items"
 * @category "Menu"
 * @summary "Create new menu items and modify existing ones"
 * @path /menu
 * @method POST
 */
Router.post('/menu', HandleEndpointFunction(async (req, res) => {


    const body = req.body
    body.active = body.active == 'true' ? 1 : 0

    const [InsertQuery, Values] = SQLUtils.BuildInsertQuery('menu', [
        'name',
        'price',
        'category_id',
        'active',
    ], body)

    const [Result] = await Database.execute(InsertQuery, Values);


    res.send()

}));



const UploadsFolder = path.join(__dirname, "../Uploads")
const MenuFolder = UploadsFolder + '/menu/'


/**
 * @displayname "Update Menu Item"
 * @category "Menu"
 * @summary "Change menu item information"
 * @path /menu
 * @method PATCH
 * @connected POST/api/menu
 */
Router.patch('/menu', HandleEndpointFunction(async (req, res) => {
    const body = req.body

    let PreviousName: string | undefined
    if (body.id && body.name) {
        const [rows]: any = await Database.execute('SELECT name FROM menu WHERE id = ?', [body.id]);
        if (rows && rows.length > 0) {
            PreviousName = rows[0].name
        }
    }

    var [SQLQuery, Values] = SQLUtils.BuildUpdateQuery('menu', ['active', 'price', 'category_id', 'order', 'name', 'description'], body, ['id'], true)

    const [Result] = await Database.execute(SQLQuery, Values) as any

    if (Result.affectedRows > 0 && PreviousName && body.name) {

        const oldFilePath = path.join(MenuFolder, `${PreviousName}.webp`);
        const newFilePath = path.join(MenuFolder, `${body.name}.webp`);
        if (fs.existsSync(oldFilePath)) {
            try {
                fs.renameSync(oldFilePath, newFilePath);
            } catch (err) {
                res.send({ error: 'Failed to update linked image' })
            }
        }
    }

    res.send()
}));

/**
 * @displayname "Update Menu Order"
 * @category "Menu"
 * @summary "Change menu item display order"
 * @path /menu/order
 * @method PATCH
 * @connected POST/api/menu
 */
Router.patch('/menu/order', HandleEndpointFunction(async (req, res) => {
    const NewOrder = req.body.order as any[]


    const WhenCases = NewOrder.map(u => `WHEN ? THEN ?`).join(' ');
    let WhereInPlaceholders: any[] = []

    const Values: any[] = [];
    NewOrder.forEach(u => {
        Values.push(u.id, u.order);
    });

    NewOrder.forEach(u => {
        Values.push(u.id);
        WhereInPlaceholders.push('?');
    });

    const QUERY = `
        UPDATE menu
        SET \`order\` = CASE id
            ${WhenCases}
            ELSE \`order\`
        END
        WHERE id IN (${WhereInPlaceholders.join(', ')})
    `;

    const [rows] = await Database.execute(QUERY, Values);
    res.send(rows);
}));


/**
 * @displayname "Delete Menu Item"
 * @category "Menu"
 * @summary "Delete an item from the menu"
 * @path /menu
 * @method DELETE
 * @connected POST/api/menu
 */
Router.delete('/menu', HandleEndpointFunction(async (Request, Response) => {

    const body = Request.body

    var SQLQuery = "DELETE FROM `menu` WHERE name=?"


    try {
        const [rows] = await Database.execute(SQLQuery, [body.name]);
        Response.send(rows)
    } catch (err:any) {
        console.error(err)
        if (err.code == 'ER_ROW_IS_REFERENCED_2') {
            Response.status(502).send({error: 'You cannot delete this item, as it has been referenced in orders before. Try disabling the product instead.'})
        } else {
            Response.status(502).send({error: 'Internal server error'})
        }
    }


}))

// const MenuFolder = path.join(__dirname, "../Uploads/menu/");

// async function CreateRandomMenuItem() {
//     const { data } = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
//     const meal = data.meals && data.meals[0];
//     if (!meal) return;

//     const name = meal.strMeal;
//     const price = (Math.random() * 20 + 5).toFixed(2);
//     const category_id = 1; 
//     const active = 1;

//     try {
//         const imageUrl = meal.strMealThumb;
//         const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//         const imageBuffer = Buffer.from(imageResp.data, 'binary');
//         const webpPath = path.join(MenuFolder, `${name}.webp`);
//         await sharp(imageBuffer)
//             .resize(300, 300)
//             .webp()
//             .toFile(webpPath);
//     } catch (err) {
//         console.error('Failed to process menu image:', err);
//     }

//     const [InsertQuery, Values] = SQLUtils.BuildInsertQuery('menu', [
//         'name',
//         'price',
//         'category_id',
//         'active'
//     ], { name, price, category_id, active });

//     await Database.execute(InsertQuery, Values);
// }

// async function GenerateMenuItems(intervalMs = 1000) {
//     while (true) {
//         await CreateRandomMenuItem();
//         await new Promise(resolve => setTimeout(resolve, intervalMs));
//     }
// }
// GenerateMenuItems();

module.exports = Router