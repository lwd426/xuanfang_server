const Router = require('koa-router');
const router = new Router();
const wine = require('./wine')
const consumers = require('./consumers')
const celler = require('./celler')
const upload = require('./upload')
// const admin = require('./administrators')
// const consumers = require('./consumers')

router.get('/', async (ctx, next) => {
  ctx.response.body = `<h1>Hello, xuanfang</h1>`;
});

// 注册酒品服务
wine(router)
consumers(router)
celler(router)
upload(router)
// 注册管理员信息维护服务
// admin(router)
// 注册用户维护服务
// consumers(router)






module.exports = router;