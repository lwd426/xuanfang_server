// 酒品维护
// 获取酒品列表
router.get('/admin/list', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});
// 按照id获取酒品详情
router.get('/admin/get', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});
// 添加酒品
router.get('/admin/add', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});
// 按照id删除酒品
router.get('/admin/delete', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});
// 编辑酒品
router.get('/admin/edit', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});