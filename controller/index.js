const Router = require('koa-router');
const router = new Router();
const wine = require('./wine')
const consumers = require('./consumers')
const celler = require('./celler')
const upload = require('./upload')
const axios = require('axios')
const config = require('../utils/config')
const utils = require('../utils/index')

const consumersService = require('../service/consumers')
const cellerService = require('../service/celler')
// const admin = require('./administrators')
// const consumers = require('./consumers')

router.get('/', async (ctx, next) => {
  ctx.response.body = `<h1>Hello, xuanfang</h1>`;
});

// 获取用户手机号 


// 获取用户的openId服务
router.post('/api/authorization_code', async (ctx, next) => {
  const info = ctx.request.body;
  const params = {
    js_code: info.js_code || '',
    grant_type: 'authorization_code',
    secret: config.secret,
    appid: config.appid
  }
  console.log('获取用户的openId');
  const response =  await axios.get(`https://api.weixin.qq.com/sns/jscode2session?${utils.getParamsToString(params)}`)
  const consumerExist = await consumersService.getConsumerById(response.data.openid, ctx)
console.log(consumerExist)
  ctx.response.body = {
    code: 0,
    msg: 'success',
    data: {
      openId: response.data.openid,
      exsit: !!consumerExist
    }
  }
  // .then(function (response) {
    
   
     
    // // 判断该用户是否存在，如果不存在，则创建酒窖信息
    // if (!consumersService.getConsumerById(openId, ctx)) {
    //   await consumers.create({
    //     id: openId,
    //     name: '贵宾'
    //   }, ctx)
    //   await celler.create({

    //   }, ctx)
    // }

  // })
  // .catch(function (error) {
  //   console.log(error);
  // });
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