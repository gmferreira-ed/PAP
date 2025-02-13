
import  config  from './configurations.js';
var Host = "http://localhost:"+config.port

export default class Database {
    constructor(DatabaseName) {
        this.DatabaseName = DatabaseName
    }



    async Get(table, rule) {
        const StringedRule = rule && "&rule="+rule || ""
       const FinalLink = Host+'/get?table='+table+StringedRule
  
       try {
        var response = await fetch(FinalLink)
        
        return response.json()
      
       } catch (error){
        console.error('Error:', error);
        throw error;
       }
        
        
        
        

    }


    async Set(table, values, rule) {
        var data = [
            table=table,
            values = values,
            rule = rule
        ]

   
        var response =  await fetch(Host+'/set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
           

            .catch(error => console.error('Error:', error));

        return response.json()
    }

   
}