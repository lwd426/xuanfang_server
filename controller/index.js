const Router = require('koa-router');
const router = new Router();
const wine = require('./wine')
// const admin = require('./administrators')
// const consumers = require('./consumers')

router.get('/', async (ctx, next) => {
  ctx.response.body = `<h1>Hello, xuanfang</h1>`;
});

// 注册酒品服务
wine(router)
// 注册管理员信息维护服务
// admin(router)
// 注册用户维护服务
// consumers(router)






module.exports = router;