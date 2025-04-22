
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetTablePage } from '../Globals.ts'

Router.get('/users', async (req, res) => {
    const query = req.query

    const page = parseInt(query.page as string) 
    let pagesize = parseInt(query.pagesize as string) 
    
    pagesize = Math.min(pagesize, 50)

    var result = await GetTablePage("users", page, pagesize)
    res.send(result)

});

module.exports = Router