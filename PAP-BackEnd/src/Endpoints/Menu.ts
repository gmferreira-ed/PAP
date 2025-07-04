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
 * @displayname "Menu"
 * @path /menu
 * @method GET
 * @summary "View menu"
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
 * @displayname "Add Menu Item"
 * @category "Menu"
 * @summary "Create a new item on the menu"
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

/**
 * @displayname "Update Menu Item"
 * @category "Menu"
 * @summary "Change menu item information"
 * @path /menu
 * @method PATCH
 */
Router.patch('/menu', HandleEndpointFunction(async (req, res) => {
    const body = req.body


    var [SQLQuery, Values] = SQLUtils.BuildUpdateQuery('menu', ['active', 'price', 'category', 'order'], body, ['id'])


    const [rows] = await Database.execute(SQLQuery, Values);
    res.send(rows)
}));

/**
 * @displayname "Update Menu Item"
 * @category "Menu"
 * @summary "Change menu item information"
 * @path /menu/order
 * @method PATCH
 */
Router.patch('/menu/order', HandleEndpointFunction(async (req, res) => {
    const NewOrder = req.body.order as any[]


    const WhenCases = NewOrder.map(u => `WHEN ? THEN ?`).join(' ');
    let WhereInPlaceholders:any[] = []

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
 */
Router.delete('/menu', HandleEndpointFunction(async (Request, Response) => {

    const body = Request.body

    var SQLQuery = "DELETE FROM `menu` WHERE name=?"


    const [rows] = await Database.execute(SQLQuery, [body.name]);
    Response.send(rows)


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