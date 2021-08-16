const SQL = require('../utils/sqls')
const config = require('../utils/config')
const moment = require('moment')

module.exports = function (router) {
  router.get(config.prefix + '/consumers/list', async (ctx, next) => {
    const SELECT_CELLER = 'SELECT t.*,w.NAME as wine_name, t.money  from (SELECT c.id,c.user_id,v.money,c.wine_id,c.count,v.name,v.union_id FROM xf_celler c INNER JOIN xf_vip v ON c.user_id=v.union_id) t INNER JOIN xf_wine w ON t.wine_id=w.id;'
    const resp = await ctx.util.db.query(SELECT_CELLER)
  
    let result = []
    // todo 验证客户维护酒窖信息是否正确
    resp.forEach(consumers => {
      let ce_vip = result.find(p => p.user_id === consumers.user_id)
      if (!ce_vip) {
        result.push({
          id: consumers.id, 
          name: consumers.name || '',
          user_id: consumers.user_id, 
          money: consumers.money || 0,
          wines: [
            {
              wine_id: consumers.wine_id, 
              wine_name: consumers.wine_name || '',
              count: consumers.count
            }
          ]
        })
      } else {
        let vip_wine = ce_vip.wines.find(w => w.wine_id === consumers.wine_id)
        if (vip_wine) {
          vip_wine.count = vip_wine.count + consumers.count
        } else {
          ce_vip.wines && ce_vip.wines.push({
            wine_id: consumers.wine_id, 
            wine_name: consumers.wine_name || '',
            count: consumers.count
          })
        }
        
      }
    })
    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: result
    }
    
  });

  router.post(config.prefix + '/consumer/get', async (ctx, next) => {
    let consumer = ctx.request.body;
    const SELECT_CELLER = `SELECT * FROM (SELECT SUM(c.count) as count,c.wine_id,c.user_id FROM xf_celler c WHERE c.user_id='${consumer.id}' GROUP BY c.wine_id) t LEFT JOIN xf_vip v ON t.user_id=v.union_id;`
    const resp = await ctx.util.db.query(SELECT_CELLER)
  
    let result = {}
    // todo 验证客户维护酒窖信息是否正确
    resp.forEach((record, index) => {
      if (index === 0) {
        result = {
          name: record.name,
          money: record.money,
          celler: [{
            wineId: record.wine_id,
            count: record.count
          }],
          wineCount: record.count
        }
      } else {
        result.celler.push({
            wineId: record.wine_id,
            count: record.count
        })
        result.wineCount = result.wineCount + record.wineCount
      }
      
    })
    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: result
    }
    
  });

   // 添加客户
   router.post(config.prefix + '/consumer/create', async (ctx, next) => {
    let consumers = ctx.request.body;
    consumers = {
      union_id: consumers.openId,
      name: consumers.userInfo.nickName,
      create_time: moment().unix()
    }
    console.log(`执行语句添加客户语句:` + SQL.INSERT_DATAS('xf_vip', consumers))
    const resp = await ctx.util.db.query(SQL.INSERT_DATAS('xf_vip', consumers))
    
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
    
  });
  // 按照id删除客户
  router.post(config.prefix + '/consumers/delete/:id', async (ctx, next) => {
    const id = ctx.params.id;
    console.log(`执行语句SQL.DELETE_DATA_BY_OPTIONS('xf_celler', {id})`)
    const resp = await ctx.util.db.query(SQL.DELETE_DATA_BY_OPTIONS('xf_celler', {id}))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
  });
  // 编辑客户
  router.post(config.prefix + '/consumers/edit/:id', async (ctx, next) => {
    let consumers = ctx.request.body;
    const id = ctx.params.id;
   
    delete consumers._index
    delete consumers._rowKey
    delete consumers.id
    consumers = {
      name: consumers.name,
      money: consumers.money
    }
    console.log(`执行编辑客户语句:` + SQL.UPDATE_DATA('xf_vip',id, consumers))
    const resp = await ctx.util.db.query(SQL.UPDATE_DATA('xf_vip',id, consumers))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
  });
}