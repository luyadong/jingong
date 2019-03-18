//list.js
import { creatIimeHandle } from '../../../lib/utils/common.js'
var MyTableObject = new wx.BaaS.TableObject('workflow')
import {region} from './config';
const app = getApp()

Page({
  data: {
    regionSelect: ["北京市", "北京市"],
    workTypeSelect: "水电工",
    activeId: "水电工",
    popup: false,
    items: region,
    mainActiveIndex: 0,
    workList: [],
    page: 1,
    pageSize: 5,
    total_count: 0,
    scrollTop: 0,
    endHidden: true,
  },

  onLoad: function (options) {
    app.editWorkTabBar();
    //设置列表显示的宽度和高度
    const res = wx.getSystemInfoSync()
    const windowWidth = res.windowWidth
    var scrollHeight = res.windowHeight - 45 - 60
    this.setData({
      scrollHeight: scrollHeight,
      windowWidth: windowWidth
    })
    this.queryWorkList()
  },

  //获取工单数据函数
  queryWorkList: function (page = 1, pageSize = 5, type = null) {
    const openid = wx.getStorageSync('openid')
    if (!openid) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none',
      })
      return
    }
    wx.showNavigationBarLoading()
    var offset = pageSize * (page - 1)
    var query = new wx.BaaS.Query()
    query.arrayContains('region', this.data.regionSelect)
    query.compare('workType', '=', this.data.workTypeSelect)
    query.compare('del', '=', false)
    MyTableObject.setQuery(query).orderBy('-created_at').limit(pageSize).offset(offset).find().then(res => {
      const { total_count } = res.data.meta
      const dataList = res.data.objects
      var workList = []
      if (type === "down") {
        workList = this.data.workList
      }

      if (dataList) {
        for (let i = 0; i < dataList.length; i++) {
          const date = dataList[i].date.split("T")[0]
          
          let _pay = dataList[i].pay
          if (_pay !== "面议"){
            _pay = _pay + "元/天"
          }

          const created_at = dataList[i].created_at
          const _created_at = creatIimeHandle(created_at) + "发布"
          workList.push({
            ...dataList[i],
            date: date,
            pay: _pay,
            created_at: _created_at
          })
        }
      }
      //判断是否数据是否到底
      var endHidden = true
      if (total_count <= page * pageSize) {
        endHidden = false
      }
      this.setData({
        workList: workList,
        page: page,
        pageSize: pageSize,
        endHidden: endHidden
      })
      wx.hideNavigationBarLoading()
    }, err => {
      wx.hideNavigationBarLoading()
    })
  },

  //工单类型弹窗操作
  togglePopup() {
    this.setData({
      popup: !this.data.popup
    });
  },

  //工单类型菜单选择，这个数据后台不用，只是前端分类用
  onClickNav({ detail }) {
    this.setData({
      mainActiveIndex: detail.index || 0
    });
  },

  //选取工单类型，单选
  onClickItem({ detail }) {
    this.setData({
      workTypeSelect: detail.id
    });
  },

  //选取工单类型确认按钮操作
  workTypeEnter: function(){
    this.togglePopup()
    this.queryWorkList()
  },

  //选取工单类型取消操作
  workTypeCancel: function(){
    this.togglePopup()
    const workTypeSelect = this.data.activeId
    this.setData({
      workTypeSelect,
    })
  },

  //选取省市区，单选
  regionChange: function (e) {
    const value = e.detail.value
    let region = []
    for (let i = 0; i < value.length; i++){
      if (value[i]!=="全部"){
        region.push(value[i])
      }
    }
    this.setData({
      regionSelect: region
    })
    this.queryWorkList()
  },

  //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
  scroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },

  //到底部加载更多
  bindDownLoad: function () {
    //如果是向下划到底加载数据，判断是否上次加载完成的是否是否到底，到底的话不在去服务端请求
    if (!this.data.endHidden) {
      return true
    }
    var page = this.data.page + 1
    this.queryWorkList(page, this.data.pageSize, "down")
  },

  //查看工单
  checkClick: function (e) {
    wx.navigateTo({
      url: '/pages/worker/jobdetail/index?id=' + e.currentTarget.dataset.id,
    })
  }
})