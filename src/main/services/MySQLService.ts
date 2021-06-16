import { Service } from './Service'
const mysql = require('mysql')

export class MySQLService extends Service {

    constructor(logger){
        super(logger)
    }

    async testConnection(node) {
        return new Promise((resolve, reject) => {
            const connection = mysql.createConnection({
                host: node.host,
                port: node.port,
                user: node.username,
                password: node.password
            })
            connection.connect(function (err) {
                if(err){
                    return reject(err);
                }
                resolve(true)
            })
        });
    }

    getDatabases (node) {
        return new Promise((resolve, reject) => {
            const connection = mysql.createConnection({
                host: node.host,
                port: node.port,
                user: node.username,
                password: node.password
            })
            connection.connect(function (err) {
                if(err){
                    return reject(err);
                }else{
                    connection.query('select * from information_schema.schemata', function (error, results, fields) {
                        if(err) {
                            return reject(err);
                        }
                        return resolve(results)
                    })
                }
            })
        });

    }

    async getDatabaseInfo (node, databaseName) {
        const that = this
        return new Promise((resolve, reject) => {
            const connection = mysql.createConnection({
                host: node.host,
                port: node.port,
                user: node.username,
                password: node.password
            })
            connection.connect(async function (err) {
                if(err){
                    return reject(err);
                }else{
                    const tables:any = await that.query(connection, 'select * from information_schema.tables where table_schema="' + databaseName + '" order by table_name asc',null)

                    const res = {}

                    for (const i in tables) {
                        const table = tables[i]
                        const columns:any = await that.query(connection, 'select * from information_schema.columns where table_schema="' + databaseName + '" and table_name="' + table.TABLE_NAME + '"',null)
                        const indexes:any = await that.query(connection, 'select *,GROUP_CONCAT(COLUMN_NAME) as COLUMN_NAME_ALL from information_schema.statistics where table_schema="' + databaseName + '" and table_name="' + table.TABLE_NAME + '" group by INDEX_NAME',null)

                        const columnMap = {}
                        for (const ci in columns) {
                            columnMap[columns[ci].COLUMN_NAME] = columns[ci]
                        }

                        const indexMap = {}
                        for (const ii in indexes) {
                            indexMap[indexes[ii].INDEX_NAME] = indexes[ii]
                        }

                        res[table.TABLE_NAME] = {
                            Meta: table,
                            Columns: columnMap,
                            Indexes: indexMap
                        }
                    }
                    resolve(res)
                }
            })
        })
    }

    async query (connection, sql, values) {
        // 返回一个 Promise
        return new Promise((resolve, reject) => {
            connection.query(sql, values, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }
}
