import { creatIimeHandle } from '../../../lib/utils/common.js'
import Dialog from '../../../lib/style/vant-weapp/dist/dialog/dialog'
import Notify from '../../../lib/style/vant-weapp/dist/notify/notify'
import Toast from '../../../lib/style/vant-weapp/dist/toast/toast'
var app = getApp();
var ContactObject = new wx.BaaS.TableObject('contact')
var WorkflowObject = new wx.BaaS.TableObject('workflow')

Page({
  data: {
    tabbar: {},
    currentTab: false,
    workList: [],
    page: 1,
    pageSize: 5,
    total_count: 0,
    hdStatus: true,
    scrollHeight: 998,
    windowWidth: 750,
    scrollTop: 0,
    endHidden: true,
    show: false
  },

  //获取工单数据函数
  queryWorkList: function (phone, page = 1, pageSize = 5, type = null) {
    try {
      const workId = wx.getStorageSync('uid')
      console.log("workId==>", workId)
      if (!workId) {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
        })
        return
      }
      wx.showNavigationBarLoading()
      var offset = pageSize * (page - 1)
      var query = new wx.BaaS.Query()
      query.compare('workId', '=', workId)
      query.compare('phone', '=', phone)
      ContactObject.setQuery(query).orderBy('-updated_at').limit(pageSize).offset(offset).find().then(res => {
        const { total_count } = res.data.meta
        const dataList = res.data.objects
        var workList = []
        var workflowIds = []

        if (dataList && dataList.length > 0) {
          dataList.map(item => workflowIds.push(item.workflowId))
          console.log("workflowIds==>", workflowIds)
          let _query = new wx.BaaS.Query()
          _query.in('id', workflowIds)
          WorkflowObject.setQuery(_query).orderBy('-updated_at').find().then(res => {
            const _workList = res.data.objects 
            console.log("_workList===>", _workList)
            if (type === "down") {
              workList = this.data.workList
            }
            for (let i = 0; i < _workList.length; i++) {
              const date = _workList[i].date.split("T")[0]
              const created_at = _workList[i].created_at
              const _created_at = creatIimeHandle(created_at) + "发布"
              workList.push({
                ..._workList[i],
                date: date,
                created_at: _created_at
              })
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
            console.log("data===>", this.data.workList)
            wx.hideNavigationBarLoading()

          }, err => {
            Toast("获取列表信息失败")
          })
        }else{
          wx.hideNavigationBarLoading()
          Toast("暂无数据")
        }

      }, err => {
        wx.hideNavigationBarLoading()
        console.log("err==>", err)
      })
    } catch(err) {
      console.log("err==>", err)
      wx.hideNavigationBarLoading()
      Toast("获取列表失败")
    }
  },
  onLoad: function () {
    //加载tabbar
    app.editWorkTabBar();

    //设置列表显示的宽度和高度
    const res = wx.getSystemInfoSync()
    const windowWidth = res.windowWidth
    var scrollHeight = res.windowHeight - 45 - 60
    this.setData({
      scrollHeight: scrollHeight,
      windowWidth: windowWidth
    })

    this.queryWorkList(this.data.currentTab)
  },

  //点击切换
  clickTab: function (e) {
    if (this.data.currentTab === e.currentTarget.dataset.current) {
      return false;
    } else {
      this.setData({
        currentTab: e.currentTarget.dataset.current,
        workList: []
      })
      this.queryWorkList(this.data.currentTab)
    }
  },

  //到底部加载更多
  bindDownLoad: function () {
    //如果是向下划到底加载数据，判断是否上次加载完成的是否是否到底，到底的话不在去服务端请求
    console.log("hidden==>", this.data.endHidden)
    if (!this.data.endHidden) {
      return true
    }
    var page = this.data.page + 1
    this.queryWorkList(this.data.currentTab, page, this.data.pageSize, "down")
  },

  //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
  scroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },

  //查看工单
  checkClick: function (e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/worker/jobdetail/index?id=' + e.currentTarget.dataset.id,
    })
  }
})