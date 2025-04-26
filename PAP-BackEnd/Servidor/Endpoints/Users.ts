
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetTablePage } from '../Globals.ts'


/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Retrieve a list of JSONPlaceholder users
 *     description: Retrieve a list of users from JSONPlaceholder. Can be used to populate a list of fake users when prototyping or testing an API.
*/

Router.get('/users', async (req, res) => {
    const query = req.query

    const page = parseInt(query.page as string) 
    let pagesize = parseInt(query.pagesize as string) 
    
    pagesize = Math.min(pagesize, 50)

    var result = await GetTablePage("users", page, pagesize)
    res.send(result)

});

module.exports = Router