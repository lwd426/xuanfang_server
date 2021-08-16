module.exports = {
  getConsumerById: async function (id, ctx) {
    console.log('执行SQL语句，根据openId查询用户：'+`SELECT * from xf_vip where union_id='${id}'`)
    const SELECT_CONSUMER = `SELECT * from xf_vip where union_id='${id}'`
    const resp = await ctx.util.db.query(SELECT_CONSUMER)
    return resp.length ? resp[1] : null
  }
}