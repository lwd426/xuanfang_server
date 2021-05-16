const Koa = require('koa');
const router = require('./controller/index')
// 创建一个Koa对象表示web app本身:
const app = new Koa();
const koaBody = require('koa-body')
const cors = require('koa2-cors')
app.use(
  cors({
      origin: function(ctx) { //设置允许来自指定域名请求
          if (ctx.url === '/test') {
              return '*'; // 允许来自所有域名请求
          }
          return 'http://localhost:8080'; //只允许http://localhost:8080这个域名的请求
      },
      maxAge: 5, //指定本次预检请求的有效期，单位为秒。
      credentials: true, //是否允许发送Cookie
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
      allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
      exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
  })
);

app.use(koaBody())

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

// 挂载数据服务
app.use(async (ctx, next) => {
  //挂载到util中
  ctx.util = {
    db: require('./utils/db')
  }
  await next()
})

// 把请求分发给controller处理
app.use(router.routes());

// 在端口3000监听:
app.listen(3000);
console.log('app started at port 3000...');