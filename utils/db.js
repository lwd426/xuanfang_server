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
    },
    getConn (sql, callback, host = db.host) {
        return new Promise(( resolve, reject ) => {
            if (!pools.hasOwnProperty(host)) {//是否存在连接池
                pools[host] = mysql.createPool(db)
            }
            pools[host].getConnection((err, connection) => {//初始化连接池
                if (err) {
                    reject(err)
                } else {
                    resolve(connection)
                }
            })
        })
    }
    // transaction: (sqls) => {
    //     connection.beginTransaction( err => {
    //         if(err) {
    //           return '开启事务失败'
    //         } else {
    //             sqls.forEach(sql => {
    //                 connection.query(sql, (e, rows, fields) => {
    //                     if(e) {
    //                       return connection.rollback(() => {
    //                         console.log('插入失败数据回滚')
    //                       })
    //                     }
    //                     connection.query(sql, (e, rows, fields) => {
    //                         if(e) {
    //                           return connection.rollback(() => {
    //                             console.log('插入失败数据回滚')
    //                           })
    //                         } else {
    //                           connection.commit((error) => {
    //                             if(error) {
    //                               console.log('事务提交失败')
    //                             }
    //                           })
    //                           connection.release()  // 释放链接
    //                           return {rows, success: true}  // 返回数据库操作结果这里数据格式可根据个人或团队规范来定制
    //                         }
    //                     })
    //                     //   connection.commit((error) => {
    //                     //     if(error) {
    //                     //       console.log('事务提交失败')
    //                     //     }
    //                     //   })
    //                     //   connection.release()  // 释放链接
    //                     //   return {rows, success: true}  // 返回数据库操作结果这里数据格式可根据个人或团队规范来定制
                        
    //                 })
    //             })
    //         }
    //     })
    // }
}