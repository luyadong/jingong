//app.js
App({
  onLaunch: function () {
    //調用API從本地緩存中獲取數據
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    wx.BaaS = requirePlugin('sdkPlugin')
    //让插件帮助完成登录、支付等功能
    wx.BaaS.wxExtend(
      wx.login,
      wx.getUserInfo,
      wx.requestPayment
    )

    wx.BaaS.init('40ecdf94def34da5a74d')
  },
  editBossTabBar: function () {
    var tabbar = this.globalData.tabbar,
      currentPages = getCurrentPages(),
      _this = currentPages[currentPages.length - 1],
      pagePath = _this.__route__;
    (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
    for (var i in tabbar.bossList) {
      tabbar.bossList[i].selected = false;
      (tabbar.bossList[i].pagePath == pagePath) && (tabbar.bossList[i].selected = true);
    }
    _this.setData({
      tabbar: tabbar
    });
  },
  editWorkTabBar: function () {
    var tabbar = this.globalData.tabbar,
      currentPages = getCurrentPages(),
      _this = currentPages[currentPages.length - 1],
      pagePath = _this.__route__;
    (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
    for (var i in tabbar.workList) {
      tabbar.workList[i].selected = false;
      (tabbar.workList[i].pagePath == pagePath) && (tabbar.workList[i].selected = true);
    }
    _this.setData({
      tabbar: tabbar
    });
  },
  globalData: {
    userInfo: null,
    tabbar: {
      color: "#cdcdcd",
      selectedColor: "#D81E06",
      backgroundColor: "#ffffff",
      borderStyle: "#F7F7F7",
      bossList: [
        {
          pagePath: "/pages/boss/issue/issue",
          text: "发单",
          iconPath: "/images/tabbar/issue.png",
          selectedIconPath: "/images/tabbar/issue_select.png",
          selected: true
        },
        {
          pagePath: "/pages/boss/workbench/workbench",
          text: "我发的单",
          iconPath: "/images/tabbar/workbench.png",
          selectedIconPath: "/images/tabbar/workbench_select.png",
          selected: false
        },
        {
          pagePath: "/pages/boss/uc/uc",
          text: "个人中心",
          iconPath: "/images/tabbar/uc.png",
          selectedIconPath: "/images/tabbar/uc_select.png",
          selected: false
        }
      ], 
      workList: [
        {
          pagePath: "/pages/worker/list/list",
          text: "接单大厅",
          iconPath: "/images/tabbar/issue.png",
          selectedIconPath: "/images/tabbar/issue_select.png",
          selected: true
        },
        {
          pagePath: "/pages/worker/workbench/workbench",
          text: "我接的单",
          iconPath: "/images/tabbar/workbench.png",
          selectedIconPath: "/images/tabbar/workbench_select.png",
          selected: false
        },
        {
          pagePath: "/pages/worker/uc/uc",
          text: "个人中心",
          iconPath: "/images/tabbar/uc.png",
          selectedIconPath: "/images/tabbar/uc_select.png",
          selected: false
        }
      ],
      position: "bottom"
    },
  }
})