// 酒品维护
const SQL = require('../utils/sqls')
const config = require('../utils/config')
const hash = require('hash.js')


module.exports = function (router) {
  // 获取酒窖列表：根据客户信息和酒品聚合
  router.get(config.prefix + '/celler/list', async (ctx, next) => {
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
          name: '高端客户'
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

  // 按照id获取酒窖详情
  router.post(config.prefix + '/celler/get', async (ctx, next) => {
    const unionId = ctx.request.body.unionId;
    console.log('执行查询个人酒窖SQL')
    
    console.log(`SELECT * FROM (SELECT c.wine_id,c.count as wine_count, c.type,c.user_id, w.* FROM xf_celler c  INNER JOIN xf_wine w ON c.wine_id=w.id) t WHERE t.user_id='${unionId}'`)
    const SELECT_CELLER = `SELECT * FROM (SELECT c.wine_id,c.count as wine_count,c.type, c.user_id, w.* FROM xf_celler c  INNER JOIN xf_wine w ON c.wine_id=w.id) t WHERE t.user_id='${unionId}'`
    const resp = await ctx.util.db.query(SELECT_CELLER)
    // 根据酒id汇总
    let result = {
      ungift: 0,
      data: []
    }
    resp.forEach(wine => {
      let w = result.data.find(p => p.wine_id === wine.wine_id)
      
      if (!w) {
        result.data.push(wine)
      } else if (wine.type && wine.type === 'sub_gift'){ // 要扣除送出的礼品
        w.wine_count = w.wine_count - wine.wine_count
        result.ungift = result.ungift + wine.wine_count
      } else if (wine.type && wine.type === 'sub_gift_cancel'){ // 要加回回收的酒品
        // w.wine_count = w.wine_count + wine.wine_count
        // result.ungift = result.ungift - wine.wine_count
      } else {
        w.wine_count = w.wine_count + wine.wine_count
      }
    })

    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: result
    }

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