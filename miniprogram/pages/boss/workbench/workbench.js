import Dialog from '../../../lib/style/vant-weapp/dist/dialog/dialog'
import Notify from '../../../lib/style/vant-weapp/dist/notify/notify'
var app = getApp();
var MyTableObject = new wx.BaaS.TableObject('workflow')

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
  queryWorkList: function(finish, page=1, pageSize=5, type=null ){
    const openid = wx.getStorageSync('openid')
    console.log("openid==>", openid)
    if (!openid){
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none',
      })
      return
    }
    wx.showNavigationBarLoading()
    var offset = pageSize*(page-1)
    var query = new wx.BaaS.Query()
    query.compare('finish', '=', finish)
    query.compare('openid', '=', openid)
    query.compare('del', '=', false)
    MyTableObject.setQuery(query).orderBy('-created_at').limit(pageSize).offset(offset).find().then(res=>{
      const { total_count } = res.data.meta
      const dataList = res.data.objects
      var workList = []
      if (type==="down"){
        workList = this.data.workList
      }
      
      if (dataList){
        for (let i=0; i<dataList.length; i++){
          const date = dataList[i].date.split("T")[0]
          workList.push({
            ...dataList[i],
            date: date
          })
        }
      }
      console.log("workList===>", workList)
      //判断是否数据是否到底
      var endHidden = true
      if (total_count <= page*pageSize){
        endHidden = false
      }
      this.setData({
        workList: workList,
        page: page,
        pageSize: pageSize,
        endHidden: endHidden
      })
      wx.hideNavigationBarLoading()
    }, err=> {
      wx.hideNavigationBarLoading()
      console.log("err==>", err)
    })
  },
  onLoad: function () {
    //加载tabbar
    app.editBossTabBar();

    //设置列表显示的宽度和高度
    const res = wx.getSystemInfoSync()
    const windowWidth = res.windowWidth
    var scrollHeight = res.windowHeight-45-60
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
  bindDownLoad: function() {
    //如果是向下划到底加载数据，判断是否上次加载完成的是否是否到底，到底的话不在去服务端请求
    console.log("hidden==>", this.data.endHidden)
    if (!this.data.endHidden) {
      return true
    }
    var page = this.data.page + 1
    this.queryWorkList(this.data.currentTab, page, this.data.pageSize, "down")
  },

  //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
  scroll: function(event) {
    this.setData({
      scrollTop : event.detail.scrollTop
    });
  },

  //删除工单
  delClick: function(e) {
    Dialog.confirm({
      title: '确认删除？',
      message: '删除后可在“我的删除”中找到'
    }).then(()=>{
      console.log(e.currentTarget.dataset.id)
      let MyRecord = MyTableObject.getWithoutData(e.currentTarget.dataset.id)
      MyRecord.set('del', true)
      MyRecord.update().then(res=>{
        this.queryWorkList(true)
        Notify({
          text: '删除成功',
          duration: 1000,
          backgroundColor: '#1989fa'
        });
      },err=>{
        console.log(err)
        Notify({
          text: '删除失败',
          duration: 1000,
          backgroundColor: '#1989fa'
        });
      })
    })
  },

  //结束工单
  finishClick: function(e) {
    let MyRecord = MyTableObject.getWithoutData(e.currentTarget.dataset.id)
    MyRecord.set('finish', true)
    MyRecord.set('status', '结束')
    MyRecord.update().then(res => {
      this.queryWorkList(false)
    })
  },

  //修改工单
  changeClick: function(e){
    wx.navigateTo({
      url: '/pages/boss/isform/isform?id=' + e.currentTarget.dataset.id,
    })
  },

  //查看工单
  checkClick: function(e){
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/boss/wkdetail/wkdetail?id=' + e.currentTarget.dataset.id,
    })
  }
})