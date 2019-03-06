// 云函数入口文件
const cloud = require('wx-server-sdk')
const uuidv1 = require('uuid/v1');

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const priceMethod = JSON.stringify(event.priceMethod)
  const chargeType = event.chargeType
  const pay = event.pay
  const days = event.days
  const people = event.people
  const city = JSON.stringify(event.city)
  const address = event.address
  const date = event.date
  const phoneNumber = event.phoneNumber
  const remark = event.remark
  const labels = JSON.stringify(event.labels)
  const fileIDs = JSON.stringify(event.fileIDs)
  const openId = event.userInfo.openId
  const finish = parseInt(event.finish)
  const workType = event.workType
  const uuid = uuidv1()

  try {
    return await db.collection('work').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        priceMethod: priceMethod,
        chargeType: chargeType,
        pay: pay,
        days: days,
        people: people,
        city: city,
        address: address,
        date: date,
        phoneNumber: phoneNumber,
        remark: remark,
        labels: labels,
        fileIDs: fileIDs,
        openId: openId,
        finish: finish,
        status: 'pendding',
        workType: workType,
        uuid: uuid
      }
    })
  } catch (e) {
    console.error(e)
  }
}