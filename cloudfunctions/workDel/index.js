// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const openId = event.userInfo.openId
  const uuid = event.uuid
  const id = event.id
  console.log("id=======>", id)

  console.log("post openIdbbbbb ==>", openId)
  // try {
  //   // const delDataList = db.collection('work').field({openId: true}).where({uuid: uuid}).get()
  //   // console.log("delDataList==>", delDataList)
  //   // if (delDataList.length !== 1) {
  //   //   return {
  //   //     code: '40005',
  //   //     msg: 'delData length un eq 1'
  //   //   }
  //   // }
  //   // console.log("delDataList==>", delDataList)
  //   // const delData = delDataList.data[0]
  //   // if (delData.openId === openId){
  //   //   const delRes = db.collection('work').where({ uuid: uuid}).remove()
  //   //   const delNum = delRes.resolve.stats.removed
  //   //   if (delNum===1){
  //   //     return {
  //   //       code: 20000,
  //   //       msg: "success"
  //   //     }
  //   //   }else{
  //   //     return {
  //   //       code: 40000,
  //   //       msg: "failed"
  //   //     }
  //   //   }
  //   // }else{
  //   //   console.log("openId check failed=>[post, checked]" + openId + delData.openId)
  //   //   return {
  //   //     code: 40001,
  //   //     msg: "openId check failed."
  //   //   }
  //   // }

  //   db.collection('work').doc(id).get().then(res => {
  //     console.log("res===>", res)
  //     if (res.data.finish === 1 && res.data.openId === openId) {
  //     db.collection('work').doc(id).remove().then(res => {
  //       return {
  //         code: 20000,
  //         msg: 'success'
  //       }
  //     })
  //     .catch(err => {
  //         console.log("remove data failed,", err)
  //       })
  //     }else{
  //       console.log("finish not 1 or openId not match")
  //       return {
  //         code: 40006,
  //         msg: 'finish not 1 or openId not match'
  //       }
  //     }
  //   }).catch(err => {
  //     console.log("get doc failed, ", err)
  //     return {
  //       code: 40007,
  //       msg: 'get doc failed.'
  //     }
  //   })
  // } catch(e) {
  //   console.log("del data error =>", e)
  //   return {
  //     code: 40002,
  //     msg: "del data error: " + e
  //   }
  // }
  const myTest = db.collection('work').doc(id)
  console.log("myTest==>", myTest)
  return myTest
}