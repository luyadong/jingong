export function creatIimeHandle(create_timeStamp) {
  Date.prototype.format = function (format) {
    var date = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
      format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1
          ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
      }
    }
    return format;
  }
  let timeToDate = new Date(create_timeStamp * 1000).format('h:m:s')
  //当天零点零分时间戳
  var curr_zpStamp = new Date(new Date().setHours(0, 0, 0, 0)) / 1000
  //昨天零点零分
  var yestday_zpstamp = curr_zpStamp - 86400
  //前天零点零分时间戳
  var bfyestday_zpstamp = curr_zpStamp - 86400 * 2
  //当前时间戳
  var curr_stamp = (new Date()).valueOf() / 1000

  var formate_time
  if (create_timeStamp > curr_stamp - 3600 && create_timeStamp <= curr_stamp) {
    const minute = (create_timeStamp > curr_stamp) / 60 + 1
    formate_time = `${minute}分钟前`
  } else if (create_timeStamp > curr_zpStamp && create_timeStamp <= curr_stamp - 3600) {
    const time = new Date(create_timeStamp * 1000).format('h:m')
    formate_time = `今天 ${time}`
  } else if (create_timeStamp > yestday_zpstamp && create_timeStamp <= curr_zpStamp) {
    const time = new Date(create_timeStamp * 1000).format('h:m')
    formate_time = `昨天 ${time}`
  } else if (create_timeStamp > bfyestday_zpstamp && create_timeStamp <= yestday_zpstamp) {
    const time = new Date(create_timeStamp * 1000).format('h:m')
    formate_time = `前天 ${time}`
  } else {
    const time = new Date(create_timeStamp * 1000).format('yyyy-MM-dd h:m')
    formate_time = `${time}`
  }
  return formate_time
}

export function test(){
  
}