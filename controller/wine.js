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
    console.log(`用户买酒，执行语句`)
    try {
      const wineSql = `UPDATE xf_wine w SET w.count=w.count-${wine.count} WHERE w.id=5`
      console.log(`总仓减仓：${wineSql}`)
      const resp1 = await ctx.util.db.query(wineSql)
    } catch (e) {
      return e
    }
    try {
      const cellerSql = `INSERT INTO xf_celler (count, wine_id, user_id) VALUES(${wine.count}, ${wine.wine_id}, '${wine.union_id}')`
      console.log(`个人仓加仓：${cellerSql}`)
      const resp2 = await ctx.util.db.query(cellerSql)
    } catch (e) {
      return e
    }
    try {
      const vipSql = `UPDATE xf_vip v SET v.money=v.money-(SELECT w.current_price FROM xf_wine w WHERE id=${wine.wine_id})*${wine.count} WHERE v.union_id='${wine.union_id}'`
      console.log(`用户扣费：${vipSql}`)
      const resp4 = await ctx.util.db.query(vipSql)
    } catch (e) {
      return e
    }
    try {
      const orderSql = `INSERT INTO xf_log (union_id, wine_id, wine_count,current_price,type,create_time, money) VALUES ('${wine.union_id}', ${wine.wine_id}, ${wine.count}, (SELECT w.current_price FROM xf_wine w WHERE id=${wine.wine_id}), 'add', '${wine.createTime}', (SELECT w.current_price FROM xf_wine w WHERE id=${wine.wine_id})*${wine.count})`
      console.log(`记录日志：${orderSql}`)
      const resp4 = await ctx.util.db.query(orderSql)
    } catch (e) {
      return e
    }

    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: wine
    }
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