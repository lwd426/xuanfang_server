const SQL = require('../utils/sqls')
module.exports = function (router) {
  router.get('/consumers/list', async (ctx, next) => {
    const SELECT_CELLER = 'SELECT t.*,w.NAME as wine_name, t.money  from (SELECT c.id,c.user_id,v.money,c.wine_id,c.count,v.name  FROM xf_celler c INNER JOIN xf_vip v ON c.user_id=v.id) t INNER JOIN xf_wine w ON t.wine_id=w.id;'
    const resp = await ctx.util.db.query(SELECT_CELLER)
  
    let result = []
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
        ce_vip.wines && ce_vip.wines.push({
          wine_id: consumers.wine_id, 
          wine_name: consumers.wine_name || '',
          count: consumers.count
        })
      }
    })
    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: result
    }
    
  });
   // 添加客户
   router.post('/consumers/add', async (ctx, next) => {
    let wine = ctx.request.body;
    wine.detail_pics = wine.detail_pics && wine.detail_pics.length ? wine.detail_pics.join(',') : ''
    wine.pics = wine.pics && wine.pics.length ? wine.pics.join(',') : ''
    console.log(`执行语句添加酒品语句:` + SQL.INSERT_DATAS('xf_celler', wine))
    const resp = await ctx.util.db.query(SQL.INSERT_DATAS('xf_celler', wine))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
    
  });
  // 按照id删除客户
  router.post('/consumers/delete/:id', async (ctx, next) => {
    const id = ctx.params.id;
    console.log(`执行语句SQL.DELETE_DATA_BY_OPTIONS('xf_celler', {id})`)
    const resp = await ctx.util.db.query(SQL.DELETE_DATA_BY_OPTIONS('xf_celler', {id}))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
  });
  // 编辑客户
  router.post('/consumers/edit/:id', async (ctx, next) => {
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