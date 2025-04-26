
import type { Request as Request } from 'express';

function QueryArray(ExpectedColumns:string[] , RequestData:Request['body'] ){
    const Columns:string[] = []
    const Values:string[]  = []
    const Placeholders:string[]  = []
    
    ExpectedColumns.forEach((Column) => {
      if (RequestData.hasOwnProperty(Column)) {
        Columns.push(`\`${Column}\``); 
        Values.push(RequestData[Column]); 
        Placeholders.push('?')
      }
    });
  
    return [Columns, Values, Placeholders] 
  }
  

function BuildDeleteQuery(TargetTable:string, ExpectedColumns:string[], RequestData:Request['body'], ConditionKeys:string[]) {
    const [Columns, Values] = QueryArray(ExpectedColumns, RequestData)

    const Conditions:string[] = []
    ConditionKeys.forEach((Key) => {
        Conditions.push(Key)
        Values.push(RequestData[Key])
    })

    const WhereClause = Conditions.map(Key => `${Key}=?`).join(" AND ")
    const Query = `DELETE FROM ${TargetTable} WHERE ${WhereClause}`;


    console.log(Query, Values)
    return [Query, Values]
}


function BuildUpdateQuery(TargetTable:string, ExpectedColumns:string[], RequestData:Request['body'], ConditionKeys:string[]) {
    const [Columns, Values] = QueryArray(ExpectedColumns, RequestData)
    const Conditions:string[] = []
    
    ConditionKeys.forEach((Key) => {
        Conditions.push(Key)
        Values.push(RequestData[Key])
    })

    const SetClause = Columns.map(col => `${col}=?`).join(", ")
    const WhereClause = Conditions.map(Key => `${Key}=?`).join(" AND ")
    const Query = `UPDATE ${TargetTable} SET ${SetClause} WHERE ${WhereClause}`;

    console.log(Query, Values)
    return [Query, Values]
}

function BuildInsertQuery(TargetTable:string, ExpectedColumns:string[], RequestData:Request['body']) {

    const [Columns, Values, Placeholders] = QueryArray(ExpectedColumns, RequestData)
    const Query = `INSERT INTO \`${TargetTable}\` (${Columns.join(', ')}) VALUES (${Placeholders.join(',')})`;

    console.log(Query, Values)
    return [Query, Values]
}

export default {
    BuildUpdateQuery,
    BuildInsertQuery,
    BuildDeleteQuery,
}