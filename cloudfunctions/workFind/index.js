// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const openId = event.userInfo.openId
  const finish = parseInt(event.finish)
  const uuid = event.uuid
  const page = event.page ? event.page : 0
  const pageSize = event.pageSize ? event.pageSize : 10
  console.log("finish==>", finish)

  if (!openId) {
    return {
      code: 40001,
      msg: "未知的openId"
    }
  }

  if (uuid) {
    return await db.collection('work')
      .where({
        openId: openId,
        finish: finish,
        uuid: uuid
      })
      .skip(page * pageSize)
      .limit(pageSize)
      .get()
  }else{
    return await db.collection('work').field({
        _id: true,
        address: true,
        date: true,
        workType: true,
        status: true,
        finish: true,
        uuid: true
      })
      .where({
        openId: openId,
        finish: finish
      })
      .skip(page * pageSize)
      .limit(pageSize)
      .get()
  }
}