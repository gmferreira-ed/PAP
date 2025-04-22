function QueryArray(ExpectedColumns, RequestData){
    const Columns = []
    const Values = []
    const Placeholders = []
    
    ExpectedColumns.forEach((Column) => {
      if (RequestData.hasOwnProperty(Column)) {
        Columns.push(`\`${Column}\``); 
        Values.push(RequestData[Column]); 
        Placeholders.push('?')
      }
    });
  
    return [Columns, Values, Placeholders] 
  }
  

function BuildDeleteQuery(TargetTable, ExpectedColumns, RequestData, ConditionKeys) {
    const [Columns, Values] = QueryArray(ExpectedColumns, RequestData)

    const Conditions = []
    ConditionKeys.forEach((Key) => {
        Conditions.push(Key)
        Values.push(RequestData[Key])
    })

    const WhereClause = Conditions.map(Key => `${Key}=?`).join(" AND ")
    const Query = `DELETE FROM ${TargetTable} WHERE ${WhereClause}`;


    console.log(Query, Values)
    return [Query, Values]
}


function BuildUpdateQuery(TargetTable, ExpectedColumns, RequestData, ConditionKeys) {
    const [Columns, Values] = QueryArray(ExpectedColumns, RequestData)
    const Conditions = []
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

function BuildInsertQuery(TargetTable, ExpectedColumns, RequestData) {

    const [Columns, Values, Placeholders] = QueryArray(ExpectedColumns, RequestData)
    const Query = `INSERT INTO \`${TargetTable}\` (${Columns.join(', ')}) VALUES (${Placeholders.join(',')})`;

    console.log(Query, Values)
    return [Query, Values]
}


module.exports = {
    BuildUpdateQuery,
    BuildInsertQuery,
    BuildDeleteQuery,
}