const mysql = require('mysql');
const db = require('./config').database
let pools = {}//连接池

module.exports = {
    query: (sql, callback, host = db.host) => {
        return new Promise(( resolve, reject ) => {
            if (!pools.hasOwnProperty(host)) {//是否存在连接池
                pools[host] = mysql.createPool(db)
            }
            pools[host].getConnection((err, connection) => {//初始化连接池
                if (err) {
                    reject(err)
                } else {
                    connection.query(sql, (err, results) => {//去数据库查询数据
                        if (err) {
                            reject(err)
                        } else {
                            resolve(results)//结果回调
                            connection.release()//释放连接资源 | 跟 connection.destroy() 不同，它是销毁
                        }
                    })
                }
            })
        })
    }
}