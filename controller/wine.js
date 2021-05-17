// 酒品维护
const SQL = require('../utils/sqls')

module.exports = function (router) {
  // 获取酒品列表
  router.get('/wine/list', async (ctx, next) => {
    
    //
    const resp = await ctx.util.db.query(SQL.QUERY_DATAS('xf_wine'))
    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: resp
    }
    
  });
  // 按照id获取酒品详情
  router.get('/wine/get', async (ctx, next) => {
    let name = ctx.params.name;
    ctx.response.body = `<h1>Hello, ${name}</h1>`
  });
  // 添加酒品
  router.post('/wine/add', async (ctx, next) => {
    let wine = ctx.request.body;
    wine.detail_pics = wine.detail_pics.join(',')
    wine.pics = wine.pics.join(',')
    console.log(`执行语句添加酒品语句:` + SQL.INSERT_DATAS('xf_wine', wine))
    const resp = await ctx.util.db.query(SQL.INSERT_DATAS('xf_wine', wine))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
    
  });
  // 按照id删除酒品
  router.post('/wine/delete/:id', async (ctx, next) => {
    const id = ctx.params.id;
    console.log(`执行语句SQL.DELETE_DATA_BY_OPTIONS('xf_wine', {id})`)
    const resp = await ctx.util.db.query(SQL.DELETE_DATA_BY_OPTIONS('xf_wine', {id}))
    ctx.response.body = {
      code: 0,
      msg: 'success'
    }
  });
  // 编辑酒品
  router.post('/wine/edit/:id', async (ctx, next) => {
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