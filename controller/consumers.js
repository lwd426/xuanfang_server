// 酒品维护
// 获取酒品列表
router.get('/wine/list', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});
// 按照id获取酒品详情
router.get('/wine/get', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});
// 添加酒品
router.get('/wine/add', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});
// 按照id删除酒品
router.get('/wine/delete', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});
// 编辑酒品
router.get('/wine/edit', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});