//獲取app實例
var app = getApp();

Page({
  data: {
    tabbar: {}
  },
  onGetUserInfo: function (e) {
    // console.log("e===>", e)
    if (!this.logged && e.detail.userInfo) {
      console.log("userInfo==>", e.detail)
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName
      })
    }
  },
  sWidentify: function () {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  onLoad: function (options) {
    // 頁面初始化 options為頁面跳轉所帶來的參數

    //調用函數
    app.editWorkTabBar();
    var avatarUrl = wx.getStorageSync('avatarUrl')
    var nickName = wx.getStorageSync('nickName')
    this.setData({
      avatarUrl: avatarUrl,
      nickName: nickName,
    })
  },
  onReady: function () {
    // 頁面渲染完成
  },
  onShow: function () {
    // 頁面顯示
  },
  onHide: function () {
    // 頁面隱藏
  },
  onUnload: function () {
    // 頁面關閉
  }
})