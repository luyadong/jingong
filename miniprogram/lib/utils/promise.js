/**
 * 将wx的callback形式的API转换成支持Promise的形式
 */
module.exports = {

  promisify: api => {
    return (options, params) => {
      return new Promise((resolve, reject) => {
        api(options, params).then(res => {
          let data = res.data
          resolve(data)
        }, err => {
          reject(err)
        })
      })
    }
  }
}