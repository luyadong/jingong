//index.js
import Notify from '../../lib/style/vant-weapp/dist/notify/notify'
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
  },

  setLocalStorage: function(userInfo){
    if (userInfo.avatarUrl){
      wx.setStorage({
        key: 'avatarUrl',
        data: userInfo.avatarUrl,
      })
    }
    if (userInfo.nickName){
      wx.setStorage({
        key: 'nickName',
        data: userInfo.nickName
      })
    }
    if (userInfo.province){
      wx.setStorage({
        key: 'province',
        data: userInfo.province,
      })
    }
    if (userInfo.openid) {
      wx.setStorage({
        key: 'openid',
        data: userInfo.openid,
      })
    }
    if (userInfo.id){
      wx.setStorage({
        key: 'uid',
        data: userInfo.id,
      })
    }
    wx.setStorage({
      key: 'logged',
      data: true,
    })
  },

  onWorkRediect: function(data) {
    var logged = wx.getStorageSync("logged")
    if (!logged) {
      wx.BaaS.handleUserInfo(data).then(res => {
        console.log("用户信息"+res)
        this.setLocalStorage(res)
        wx.redirectTo({
          url: '../worker/list/list',
        })
      }, err => {
        Notify({
          text: '获取工单id失败',
          duration: 1000,
          backgroundColor: '#1989fa'
        });
      })
    }else{
      wx.redirectTo({
        url: '../worker/list/list',
      })
    }

  },

  onBossRediect: function (data) {
    var logged = wx.getStorageSync("logged")
    if (!logged) {
      wx.BaaS.handleUserInfo(data).then(res => {
        console.log(res)
        this.setLocalStorage(res)
        wx.redirectTo({
          url: '../boss/issue/issue',
        })
      }, err => {
        Notify({
          text: 'err',
          duration: 1000,
          backgroundColor: '#1989fa'
        });
      })
    }else{
      wx.redirectTo({
        url: '../boss/issue/issue',
      })
    }

  },

})
