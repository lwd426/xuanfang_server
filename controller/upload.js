// 酒品维护
const SQL = require('../utils/sqls')
const fse = require('fs-extra')
const path = require('path')
const config = require('../utils/config')

module.exports = function (router) {
  // 上传单一图片
  router.post('/img/upload', async (ctx, next) => {
    console.log(ctx.request)
    let pic = ctx.request.files.file;
    // 解析图片信息
    const picPath = pic.path
    const fileName = picPath.substr(picPath.lastIndexOf(config.staticPicsDir), picPath.length)
    // uploadFile(pic, picPath)
    // 返回图片地址
    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: path.join(config.url,fileName)
    }
    
  });

  router.post('/img/uploadMulti', async (ctx, next) => {
    let pics = ctx.request.files;
    let urls = []
    console.log(pics)
    for (let file of pics) {
      const picPath = file.path
      urls.push(picPath.substr(picPath.lastIndexOf(config.staticPicsDir), picPath.length))
    }
    // 解析图片信息
    
    // 返回图片地址
    ctx.response.body = {
      code: 0,
      msg: 'success',
      data: urls
    }
    
  });

  
  // 按照图片标识获取图片信息
  // router.get('/img/get', async (ctx, next) => {
  //   let picUrl = ctx.params.picUrl;
  //   ctx.response.body = `<h1>Hello, ${name}</h1>`
  // });
  
}

function uploadFile (file, statis_path) {
  const fs = require('fs');
  const path = require('path');
console.log(statis_path)
console.log(file.name)
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  // 获取上传文件扩展名
  let filePath = path.join(statis_path, file.name);
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);

}