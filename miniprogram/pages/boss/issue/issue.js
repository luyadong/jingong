//獲取app實例
var app = getApp();

Page({
  data: {
    tabbar: {}
  },
  onLoad: function (options) {
    // 頁面初始化 options為頁面跳轉所帶來的參數

    //調用函數
    app.editBossTabBar();
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
  },

  issueRedirect: function(event) {
    console.log(event.currentTarget.dataset.workType)
    wx.navigateTo({
      url: '/pages/boss/isform/isform?workType=' + event.currentTarget.dataset.workType,
    })
  }

})