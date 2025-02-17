import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import next from 'next';

const Server = express();
Server.use(cors())
Server.use(express.json());



// SQL AND DATABASE SETUP
const restaurant = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'restaurante',
});


async function GetTablePage(Table, PageNumber, PageSize, OrderBy){
  const SQLFunction = `SELECT * FROM ${Table}`

  PageSize = Math.min(PageSize, 100)

  if (OrderBy){
    SQLFunction = SQLFunction + `\n${OrderBy}`
  }
  if (PageNumber && PageNumber > 1){
    SQLFunction = SQLFunction + `
    OFFSET (${PageNumber} - 1) * ${PageSize} ROWS
    FETCH NEXT ${PageSize} ROWS ONLY;`
  }
  const [rows] = await restaurant.promise().query(SQLFunction);
  return rows
}






// ENDPOINTS
Server.get('/menu', async (req, res) => {
  try {
    const query = req.query
    console.log(query)
    var result = await GetTablePage("menu", query.page, 5)
    res.send(result)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

Server.get('/users', async (req, res) => {
  try {
    const query = req.query

    const SQLFunction = 'SELECT * FROM menu'
    const [rows] = await restaurant.promise().query(SQLFunction);
    res.send(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LAYOUT ENDPOINTS
Server.get('/get', async (req, res) => {
  try {

    const query = req.query

    const Rule = query.rule && " WHERE " + query.rule || ""
    const SQLFunction = 'SELECT * FROM ' + query.table + Rule

    const [rows] = await restaurant.promise().query(SQLFunction);

    res.send(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



Server.post('/set', async (req, res) => {
  try {
    const body = req.body




    const table = body[0]
    const values = body[1]
    const rule = body[2]



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
    res.send(rows);
  } catch (err) {

    res.status(500).json({ error: err.message });
    console.warn(err.message);

  }
});


Server.get("/", function(request, response){
  response.send("DinnerSync API main page")
})


Server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
