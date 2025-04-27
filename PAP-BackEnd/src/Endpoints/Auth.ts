
import express from 'express'
const Router = express.Router();
import { Database, HandleEndpointFunction, GetTablePage } from '../Globals'


Router.post('/auth', HandleEndpointFunction(async (req, res) => {
    
    const user = req.session.user

    if (user){
        res.send({user:user})
    }else{
        res.status(401).send({error:'No login'})
    }
}))

module.exports = Router