// miniprogram/pages/info/info.js
var i = 60;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    steps: [
      {
        text: '手机认证'
      },
      {
        text: '证件上传'
       
      },
      {
        text: '认证完成'
      }
    ],
    active:0, //进度
    phone:"",
    isPhone:false,
    btnName:"获取验证码",
    isClick:true
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

      console.log("active的值"+this.data.active)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getSms:function(){
    var that = this;

    if(this.data.isClick){

      if (this.data.isPhone) {
        // wx.BaaS.sendSmsCode({ phone: this.data.phone }).then(res => {
        //   // success


        //   console.log(res.data) // { "status": "ok" }
        // }).catch(e => {
        //   // err
        //   console.log(e.code) // 错误状态码
        // })

        this.setData({ isClick: false })
        this.timeGo()
      } else {
        wx.showToast({
          title: '手机号有误',
          icon: 'warn',
          duration: 2000
        })
      }
    }
    

    
  },
  getPhone:function(e){
   

  },

  timeGo:function(){
    
    i = i-1
    this.setData({
      btnName: "("+i+")重新获取"
    })

    if(i==0){
      this.setData({
        btnName: "获取验证码",
        isClick:true
      })
      i = 60
      return;
    }
    setTimeout(this.timeGo, 1000)

  },
  blurPhone:function(e){

    let value = e.detail.value;
    if (!(/^1[34578]\d{9}$/.test(value))) {
      this.setData({
        isPhone: false
      })

      if (value.length>=11){
        wx.showToast({
          title: '手机号有误',
          icon: 'warn',
          duration: 2000
        })
      }
    }else{
      this.setData({
        phone:value,
        isPhone: true
      })

    }

  }


})