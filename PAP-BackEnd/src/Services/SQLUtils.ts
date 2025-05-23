
import type { Request as Request } from 'express';

function QueryArray(ExpectedColumns: string[], RequestData: Request['body'] | any[]): [string[], any[], string[]] {
    const Columns: string[] = ExpectedColumns.map(col => `\`${col}\``);
    const Values: any[] = []
    const Placeholders: string[] = []

    const DataArray = Array.isArray(RequestData) ? RequestData : [RequestData];


    for (const Data of DataArray) {
        const rowPlaceholders: string[] = [];


        ExpectedColumns.forEach((Column) => {
            const CorrespondingValue = Data[Column]
            if (CorrespondingValue != undefined && CorrespondingValue != null) {
                Values.push(Data[Column]);
            } else {
                Values.push(null);
            }
            rowPlaceholders.push('?')

        })


        if (rowPlaceholders.length > 0)
            Placeholders.push(`(${rowPlaceholders.join(', ')})`);
    }


    return [Columns, Values, Placeholders]
}

function GetWhereClause(RequestData: { [key: string]: any }, ConditionKeys: string[]):[string|undefined, any[]] {
    const Conditions: string[] = []
    const Values: any[] = []

    ConditionKeys.forEach((Key) => {
        const Val = RequestData[Key]
        if (Val != undefined) {
            Conditions.push(Key)
            Values.push(RequestData[Key])
        }
    })
    let WhereClause:string|undefined = Conditions.map(Key => `${Key}=?`).join(" AND ")
    if (WhereClause == '')
        WhereClause = undefined
    else
        WhereClause = ' WHERE '+WhereClause

    return [WhereClause, Values]
}

function BuildSelectQuery(TargetTable: string, RequestData: Request['body'], ConditionKeys: string[]): [string, any[]] {
    let [Columns, Values] = QueryArray([], RequestData)


    const [WhereClause, WClauseValues] = GetWhereClause(RequestData, ConditionKeys)
    const Query = `SELECT * FROM ${TargetTable} ${WhereClause}`;

    return [Query, [...Values, ...WClauseValues]]
}

function BuildDeleteQuery(TargetTable: string, RequestData: Request['body'], ConditionKeys: string[]): [string, any[]] {
    let [Columns, Values] = QueryArray([], RequestData)

    const [WhereClause, WClauseValues] = GetWhereClause(RequestData, ConditionKeys)
    const Query = `DELETE FROM ${TargetTable} ${WhereClause}`;


    return [Query, [...Values, ...WClauseValues]]
}


function BuildUpdateQuery(TargetTable: string, ExpectedColumns: string[], RequestData: Request['body'], ConditionKeys: string[]): [string, any[]] {


    let [Columns, Values] = QueryArray(ExpectedColumns, RequestData)

    
    const [WhereClause, WClauseValues] = GetWhereClause(RequestData, ConditionKeys)
    const SetClause = Columns.map(col => `${col}=?`).join(", ")

    const Query = `UPDATE ${TargetTable} SET ${SetClause} ${WhereClause}`;

    return [Query, [...Values, ...WClauseValues]]
}

function BuildInsertQuery(TargetTable: string, ExpectedColumns: string[], RequestData: Request['body']): [string, any[]] {

    const [Columns, Values, Placeholders] = QueryArray(ExpectedColumns, RequestData)
    const Query = `INSERT INTO \`${TargetTable}\` (${Columns.join(', ')}) VALUES ${Placeholders.join(',')}`;

    return [Query, Values]
}

export default {
    BuildUpdateQuery,
    BuildInsertQuery,
    BuildDeleteQuery,
    BuildSelectQuery,
}