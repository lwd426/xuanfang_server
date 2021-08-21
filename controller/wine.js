// 酒品维护
const SQL = require('../utils/sqls')
const config = require('../utils/config')
const moment = require('moment')
const Decimal = require('decimal.js')

module.exports = function (router) {
  // 获取酒品列表
  router.get(config.prefix + '/wine/list', async (ctx, next) => {

    const resp = await ctx.util.db.query(SQL.QUERY_DATAS('xf_wine'))
    
    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: resp
    }

  });
  // 按照id获取酒品详情
  router.get(config.prefix + '/wine/:id', async (ctx, next) => {
    const id = ctx.params.id;
    const sql = `SELECT * FROM xf_wine WHERE id=${id}`
    console.log(`执行根据ID获取酒品语句: ${sql}`)
    const resp = await ctx.util.db.query(sql)
    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: resp ? resp[0] : undefined
    }
  });

  // 按照id购买酒品
  router.post(config.prefix + '/wine/buy', async (ctx, next) => {
    let wine = ctx.request.body;
    wine.createTime = moment().unix()
    // 先验证余额是否够、验证库存，如果不够，无法购买 
    const vipCheckSql = `SELECT v.money,w.current_price,w.count FROM xf_vip v,xf_wine w WHERE v.union_id='${wine.union_id}' AND w.id=${wine.wine_id}`
    const validateObj = await ctx.util.db.query(vipCheckSql)
    const money = validateObj[0].money
    const wine_count = validateObj[0].count
    const current_price = validateObj[0].current_price
    if (wine.count > wine_count) {
      ctx.response.body = {
        code: 1,
        msg: '该酒品库存不够',
        data: wine_count
      }
      return
    }
   
    if (new Decimal(money).sub(new Decimal(current_price).mul(new Decimal(wine.count))).toNumber() <= 0) {
      ctx.response.body = {
        code: 1,
        msg: '您余额不足',
        data: money
      }
      return
    }
    

    // 酒品仓对应酒品减仓 UPDATE xf_wine w SET w.count=w.count-2 WHERE w.id=5
    // 个人酒窖对应酒品加仓 INSERT INTO xf_celler (count, wine_id, user_id) VALUES(2, 5, 'oCpJt5C3bJZb7_BuFemH_ESygnsw')
    // 个人账户扣钱 UPDATE xf_vip v SET v.money=v.money-(SELECT w.current_price FROM xf_wine w WHERE id=5)*2 WHERE v.union_id='oCpJt5C3bJZb7_BuFemH_ESygnsw'
    // 记录购买日志 INSERT INTO xf_log (union_id, wine_id, wine_count,current_price,type,create_time, money) VALUES ('oCpJt5C3bJZb7_BuFemH_ESygnsw', 5, 2, (SELECT w.current_price FROM xf_wine w WHERE id=5), 'add', '12323423434', (SELECT w.current_price FROM xf_wine w WHERE id=5)*2)
    console.log(`用户买酒，执行事务`)
    const wineSql = `UPDATE xf_wine w SET w.count=w.count-${wine.count} WHERE w.id=${wine.wine_id}`
    const cellerSql = `INSERT INTO xf_celler (count, wine_id, user_id) VALUES(${wine.count}, ${wine.wine_id}, '${wine.union_id}')`
    const vipSql = `UPDATE xf_vip v SET v.money=v.money-(SELECT w.current_price FROM xf_wine w WHERE id=${wine.wine_id})*${wine.count} WHERE v.union_id='${wine.union_id}'`
    const orderSql = `INSERT INTO xf_log (union_id, wine_id, wine_count,current_price,type,create_time, money) VALUES ('${wine.union_id}', ${wine.wine_id}, ${wine.count}, (SELECT w.current_price FROM xf_wine w WHERE id=${wine.wine_id}), 'add', '${wine.createTime}', (SELECT w.current_price FROM xf_wine w WHERE id=${wine.wine_id})*${wine.count})`
    const connection = await ctx.util.db.getConn()
    connection.beginTransaction( err => {
      if(err) {
        return '开启事务失败'
      } else {
        console.log(`总仓减仓：${wineSql}`)
        connection.query(wineSql, (e, rows, fields) => {
            if(e) {
              return connection.rollback(() => {
                console.log('总仓减仓失败，回滚')
                ctx.response.body = {
                  code: 1,
                  msg: '事务提交失败',
                  data: wine
                }
              })
            }
            console.log(`个人仓加仓：${cellerSql}`)
            connection.query(cellerSql, (e, rows, fields) => {
                if(e) {
                  return connection.rollback(() => {
                    console.log('个人仓加仓，回滚')
                    ctx.response.body = {
                      code: 1,
                      msg: '事务提交失败',
                      data: wine
                    }
                  })
                } 
                console.log(`用户扣费：${vipSql}`)
                connection.query(vipSql, (e, rows, fields) => {
                  if(e) {
                    return connection.rollback(() => {
                      console.log('用户扣费，回滚')
                      ctx.response.body = {
                        code: 1,
                        msg: '事务提交失败',
                        data: wine
                      }
                    })
                  } 
                  console.log(`记录日志：${orderSql}`)
                  connection.query(orderSql, (e, rows, fields) => {
                    if(e) {
                      return connection.rollback(() => {
                        console.log('记录日志，回滚')
                        ctx.response.body = {
                          code: 1,
                          msg: '事务提交失败',
                          data: wine
                        }
                      })
                    } 
                    connection.commit((error) => {
                      if(error) {
                        console.log('事务提交失败')
                        ctx.response.body = {
                          code: 1,
                          msg: '事务提交失败',
                          data: wine
                        }
                      }
                    })
                    connection.release()  // 释放链接  
                    ctx.response.body = {
                      code: 0,
                      msg: 'success',
                      data: wine
                    }
                  })
                })
            })
        })
      }
  })

   
  });

 // 把送礼酒品入礼品临时库房
 router.post(config.prefix +'/wine/gift', async (ctx, next) => {
  let wine = ctx.request.body;
  wine.createTime = moment().unix()
  // 用户仓扣酒
  const cellerSql = `INSERT INTO xf_celler (count, wine_id, user_id, type, create_time) VALUES(${wine.count}, ${wine.wine_id}, '${wine.user_id}', 'sub_gift','${wine.createTime}')`
  // 酒品入礼品库
  const giftCellerSql = `INSERT INTO xf_gift (count, wine_id, user_id, accepted, create_time) VALUES(${wine.count}, ${wine.wine_id}, '${wine.user_id}', 0, '${wine.createTime}')`
  // 记录日志
  const orderSql = `INSERT INTO xf_log (union_id, wine_id, wine_count,current_price,type,create_time, money) VALUES ('${wine.user_id}', ${wine.wine_id}, ${wine.count}, (SELECT w.current_price FROM xf_wine w WHERE id=${wine.wine_id}), 'sub_gift', '${wine.createTime}', (SELECT w.current_price FROM xf_wine w WHERE id=${wine.wine_id})*${wine.count})`

  const connection = await ctx.util.db.getConn()
    connection.beginTransaction( err => {
      if(err) {
        return '开启事务失败'
      } else {
        console.log(`用户仓减仓：${cellerSql}`)
        connection.query(cellerSql, (e, rows, fields) => {
            if(e) {
              return connection.rollback(() => {
                console.log('用户仓减仓失败，回滚')
                ctx.response.body = {
                  code: 1,
                  msg: '事务提交失败',
                  data: wine
                }
              })
            }
            
                console.log(`酒品入礼品库：${giftCellerSql}`)
                connection.query(giftCellerSql, (e, rows, fields) => {
                  if(e) {
                    return connection.rollback(() => {
                      console.log('酒品入礼品库，回滚')
                      ctx.response.body = {
                        code: 1,
                        msg: '事务提交失败',
                        data: wine
                      }
                    })
                  } 
                  console.log(`记录日志：${orderSql}`)
                  connection.query(orderSql, (e, rows, fields) => {
                    if(e) {
                      return connection.rollback(() => {
                        console.log('记录日志，回滚')
                        ctx.response.body = {
                          code: 1,
                          msg: '事务提交失败',
                          data: wine
                        }
                      })
                    } 
                    connection.commit((error) => {
                      if(error) {
                        console.log('事务提交失败')
                        ctx.response.body = {
                          code: 1,
                          msg: '事务提交失败',
                          data: wine
                        }
                      }
                    })
                    console.log('酒品入礼品仓事务成功')
                    connection.release()  // 释放链接  
                    ctx.response.body = {
                      code: 0,
                      msg: 'success',
                      data: wine
                    }
                  })
                })
            })
      }
  })
}); 


// 回收所有酒品
router.post(config.prefix + '/wine/recycle', async (ctx, next) => {
  const wine = ctx.request.body;
  console.log('执行回收个人所有酒品SQL')
  const updateTime = moment().unix()
  // 回收酒品放回个人仓
  const cellerSql = `UPDATE xf_celler c SET c.type='sub_gift_cancel',c.update_time='${updateTime}' WHERE c.user_id='${wine.user_id}' AND c.type='sub_gift'`
  // 礼品库去掉酒品
  const giftCellerSql = `UPDATE xf_gift g SET g.cancel=1,g.update_time='${updateTime}' WHERE g.user_id='${wine.user_id}'`
  // 记录日志
  const orderSql = `INSERT INTO xf_log (union_id, type,create_time) VALUES ('${wine.user_id}', 'sub_gift_cancel', '${updateTime}')`

  const connection = await ctx.util.db.getConn()
    connection.beginTransaction( err => {
      if(err) {
        return '开启事务失败'
      } else {
        console.log(`回收酒品放回个人仓：${cellerSql}`)
        connection.query(cellerSql, (e, rows, fields) => {
            if(e) {
              return connection.rollback(() => {
                console.log('回收酒品放回个人仓失败，回滚')
                ctx.response.body = {
                  code: 1,
                  msg: '事务提交失败',
                  data: wine
                }
              })
            }
            
                console.log(`礼品库去掉酒品：${giftCellerSql}`)
                connection.query(giftCellerSql, (e, rows, fields) => {
                  if(e) {
                    return connection.rollback(() => {
                      console.log('礼品库去掉酒品，回滚')
                      ctx.response.body = {
                        code: 1,
                        msg: '事务提交失败',
                        data: wine
                      }
                    })
                  } 
                  console.log(`记录日志：${orderSql}`)
                  connection.query(orderSql, (e, rows, fields) => {
                    if(e) {
                      return connection.rollback(() => {
                        console.log('记录日志，回滚')
                        ctx.response.body = {
                          code: 1,
                          msg: '事务提交失败',
                          data: wine
                        }
                      })
                    } 
                    connection.commit((error) => {
                      if(error) {
                        console.log('事务提交失败')
                        ctx.response.body = {
                          code: 1,
                          msg: '事务提交失败',
                          data: wine
                        }
                      }
                    })
                    console.log('酒品入礼品仓事务成功')
                    connection.release()  // 释放链接  
                    ctx.response.body = {
                      code: 0,
                      msg: 'success',
                      data: wine
                    }
                  })
                })
            })
      }
  })

});
  // 添加酒品
  router.post(config.prefix +'/wine/add', async (ctx, next) => {
    let wine = ctx.request.body;
    wine.detail_pics = wine.detail_pics && wine.detail_pics.length ? wine.detail_pics.join(',') : ''
    wine.pics = wine.pics && wine.pics.length ? wine.pics.join(',') : ''
    console.log(`执行语句添加酒品语句:` + SQL.INSERT_DATAS('xf_wine', wine))
    const resp = await ctx.util.db.query(SQL.INSERT_DATAS('xf_wine', wine))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }

  });
  // 按照id删除酒品
  router.post(config.prefix + '/wine/delete/:id', async (ctx, next) => {
    const id = ctx.params.id;
    console.log(`执行语句SQL.DELETE_DATA_BY_OPTIONS('xf_wine', {id})`)
    const resp = await ctx.util.db.query(SQL.DELETE_DATA_BY_OPTIONS('xf_wine', {id}))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
  });
  // 编辑酒品
  router.post(config.prefix + '/wine/edit/:id', async (ctx, next) => {
    let wine = ctx.request.body;
    const id = ctx.params.id;

    delete wine._index
    delete wine._rowKey
    delete wine.id
    console.log(`执行编辑酒品语句:` + SQL.UPDATE_DATA('xf_wine',id, wine))
    const resp = await ctx.util.db.query(SQL.UPDATE_DATA('xf_wine',id, wine))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
  });
}