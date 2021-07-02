//配置文件：数据库配置/日志配置/服务配置/....

let config = {}

if (process.env.NODE_ENV === 'prod') {
  config = {
    port:3000,
    url: 'http://server.xuanfang.club',
    cors_access: 'http://127.0.0.1:3000',
    pic_url: 'http://pics.xuanfang.club',
    database:{
      host:'82.156.126.48',
      port:'3306',
      user:'lwd',
      password:'sjwwdl',
      database:'xuanfang'
    },
    staticDir: '/home/lwd',
    staticPicsDir: `/static/pics`
  }
} else if (process.env.NODE_ENV === 'dev') {
  config = {
    port:3000,
    cors_access: 'http://127.0.0.1:8080',
    url: 'http://localhost:3000',
pic_url: 'http://pics.xuanfang.club',
    database:{
      host:'82.156.126.48',
      port:'3306',
      user:'lwd',
      password:'sjwwdl',
      database:'xuanfang'
    },
    staticDir: '/Users/hexin/Documents',
    staticPicsDir: `/static/pics`
  }
}

module.exports = config;
