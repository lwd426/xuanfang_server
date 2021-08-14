// 酒品维护
const SQL = require('../utils/sqls')

module.exports = function (router) {
  // 获取酒窖列表：根据客户信息和酒品聚合
  router.get('/celler/list', async (ctx, next) => {
    const SELECT_CELLER = 'SELECT t.*,w.NAME as wine_name, t.money  from (SELECT c.id,c.user_id,v.money,c.wine_id,c.count,v.NAME  FROM xf_celler c INNER JOIN xf_vip v ON c.user_id=v.id) t INNER JOIN xf_wine w ON t.wine_id=w.id;'
    const resp = await ctx.util.db.query(SELECT_CELLER)
   
    let result = []
    resp.forEach(celler => {
      let ce_vip = result.find(p => p.user_id === celler.user_id)
      if (!ce_vip) {
        result.push({
          id: 1, 
          user_id: 1, 
          wines: [
            {
              wine_id: celler.wine_id, 
              wine_name: celler.wine_name || '',
              count: celler.count
            }
          ],
          name: 'ä¼Ÿä¸œ'
        })
      } else {
        ce_vip.wines && ce_vip.wines.push({
          wine_id: celler.wine_id, 
          wine_name: celler.wine_name || '',
          count: celler.count
        })
      }
    })
    console.log(result)
    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: result
    }
    
  });
  // 按照id获取酒品详情
  router.get('/celler/get', async (ctx, next) => {
    let name = ctx.params.name;
    ctx.response.body = `<h1>Hello, ${name}</h1>`
  });
  // 添加酒窖
  router.post('/wine/add', async (ctx, next) => {
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
  // 按照id删除酒窖
  router.post('/celler/delete/:id', async (ctx, next) => {
    const id = ctx.params.id;
    console.log(`执行语句SQL.DELETE_DATA_BY_OPTIONS('xf_celler', {id})`)
    const resp = await ctx.util.db.query(SQL.DELETE_DATA_BY_OPTIONS('xf_celler', {id}))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
  });
  // 编辑酒窖
  router.post('/celler/edit/:id', async (ctx, next) => {
    let wine = ctx.request.body;
    const id = ctx.params.id;
   
    delete wine._index
    delete wine._rowKey
    delete wine.id
    console.log(`执行编辑酒品语句:` + SQL.UPDATE_DATA('xf_celler',id, wine))
    const resp = await ctx.util.db.query(SQL.UPDATE_DATA('xf_celler',id, wine))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
  });
}