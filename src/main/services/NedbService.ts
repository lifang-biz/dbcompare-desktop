import { Service } from './Service'
import {Logger} from "/@main/logger";
import path from "path";
const Datastore = require('nedb');
const {app} = require('electron');

export class NedbService extends Service {
    private readonly nedb;

    private offset
    private limit

    private orderby

    constructor(logger){
        super(logger)

        let filename = ''
        if (process.env.NODE_ENV === 'development') {
            filename = "./data.db"
        }else{
            if(process.platform === 'darwin'){
                filename = path.dirname(app.getAppPath()) + "/data.db"
            }else{
                filename = app.getAppPath() + "/data.db"
            }
        }

        const config = {
            filename: filename,
            autoload: true,
            timestampData: true,
        }

        this.nedb = new Datastore(config)
    }

    setLimit (offset, limit) {
        this.offset = offset || 0
        this.limit = limit || 15
        return this
    }

    setSort  (orderby) {
        this.orderby = orderby
        return this
    }

    async find(query, select) {
        return new Promise((resolve, reject) => {
            const stmt = this.nedb.find(query || {})
            if (this.orderby !== undefined) {
                stmt.sort(this.orderby)
            }
            if (this.offset !== undefined) {
                stmt.skip(this.offset).limit(this.limit)
            }
            if (select !== undefined) {
                stmt.projection(select || {})
            }
            stmt.exec((err, docs) => {
                if (err) {
                    return reject(err)
                }
                resolve(docs)
            })
        })
    }

    async findOne(query, select) {
        return new Promise((resolve, reject) => {
            const stmt = this.nedb.findOne(query || {})
            if (this.orderby !== undefined) {
                stmt.sort(this.orderby)
            }
            if (select !== undefined) {
                stmt.projection(select || {})
            }
            stmt.exec((err, doc) => {
                if (err) {
                    return reject(err)
                }
                resolve(doc)
            })
        })
    }

    async insert(values) {
        return new Promise((resolve, reject) => {
            this.nedb.insert(values, (err, newDoc) => {
                if (err) {
                    return reject(err)
                }
                resolve(newDoc)
            })
        })
    }

    async update(query, values, options) {
        return new Promise((resolve, reject) => {
            this.nedb.update(query || {}, values || {}, options || {}, (err, numAffected) => {
                if (err) {
                    return reject(err)
                }
                resolve(numAffected)
            })
        })
    }

    async remove (query, options) {
        return new Promise((resolve, reject) => {
            this.nedb.remove(query || {}, options || {}, (err, numAffected) => {
                if (err) {
                    return reject(err)
                }
                resolve(numAffected)
            })
        })
    }
}
