const SQL = require('../utils/sqls')

module.exports = {
  getConsumerById: async function (id, ctx) {
    console.log('执行SQL语句，根据openId查询用户：'+`SELECT * from xf_vip where union_id='${id}'`)
    const SELECT_CONSUMER = `SELECT * from xf_vip where union_id='${id}'`
    const resp = await ctx.util.db.query(SELECT_CONSUMER)
    return resp.length ? resp[1] : null
  },
  create: async function (consumers) {
    consumers = {
      union_id: consumers.userId,
      name: consumers.userInfo.nickName,
      create_time: moment().unix()
    }
    console.log(`执行语句添加客户语句:` + SQL.INSERT_DATAS('xf_vip', consumers))
    const resp = await ctx.util.db.query(SQL.INSERT_DATAS('xf_vip', consumers))
  }
}