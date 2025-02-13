import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import SwaggerUI from 'swagger-ui'

const app = express();
app.use(cors())
app.use(express.json());



// SQL AND DATABASE SETUP
const restaurant = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'restaurante',
});


// ENDPOINTS


app.get('/menu', async (req, res) => {
  try {

    const query = req.query

    const SQLFunction = 'SELECT * FROM '
    const [rows] = await restaurant.promise().query(SQLFunction);
    res.json(rows);

    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LAYOUT ENDPOINTS
app.get('/get', async (req, res) => {
  try {

    const query = req.query

    const Rule = query.rule && " WHERE " + query.rule || ""
    const SQLFunction = 'SELECT * FROM ' + query.table + Rule

    const [rows] = await restaurant.promise().query(SQLFunction);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post('/set', async (req, res) => {
  try {
    const query = req.body




    const table = query[0]
    const values = query[1]
    const rule = query[2]


    console.log(query)


    const rulestring = rule && "WHERE " + rule || ""

    var SQLFunction = ""

    if (values != null) {
      const keysArray = Object.keys(values)
      const valuesArray = Object.values(values)


      const keysString = keysArray.map(key => `\`` + key + `\``).join(",")
      const valuesString = valuesArray.map(value =>
        typeof value === 'string' ? `'${value}'` : value
      ).join(", ");

      const setString = Object.entries(values)
        .map(([key, value]) => `\`${key}\` = ${typeof value === 'string' ? `'${value}'` : value}`)
        .join(", ");

      SQLFunction = `
       INSERT INTO ${table} (${keysString}) 
       VALUES (${valuesString}) 
    
    
      ON DUPLICATE KEY UPDATE 
      ${setString} 
      ${rulestring} ;`
    } else {
      SQLFunction = `DELETE FROM ${table} ` + rulestring
    }

    
    SQLFunction = SQLFunction.replace(/\n/g, '')

    const [rows] = await restaurant.promise().query(SQLFunction);
    res.json(rows);
  } catch (err) {

    res.status(500).json({ error: err.message });
    console.warn(err.message);

  }
});





app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
