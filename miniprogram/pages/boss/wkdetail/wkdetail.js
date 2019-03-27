import Notify from '../../../lib/style/vant-weapp/dist/notify/notify'
import Toast from '../../../lib/style/vant-weapp/dist/toast/toast'
import { creatIimeHandle } from '../../../lib/utils/common.js'
var app = getApp();
var MyTableObject = new wx.BaaS.TableObject('workflow')
var ContactObject = new wx.BaaS.TableObject('contact')

Page({
  data: {
    leaveMsgInfo: [],
    scrollTop: 0,
    scrollHeight: 998,
    page: 1,
    pageSize: 5,
    end: false
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "工单详情"
    })
    //设置列表显示的宽度和高度
    const res = wx.getSystemInfoSync()
    const windowWidth = res.windowWidth
    var scrollHeight = res.windowHeight - 43
    this.setData({
      scrollHeight: scrollHeight,
      windowWidth: windowWidth
    })
    const id = options.id
    if (!id){
      Notify({
        text: '获取工单id失败',
        duration: 1000,
        backgroundColor: '#1989fa'
      });
      return
    }
    const openid = wx.getStorageSync('openid')
    if (!openid) {
      Notify({
        text: '获取openid失败',
        duration: 1000,
        backgroundColor: '#1989fa'
      });
      return
    }
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    this.getWkinfo(openid, id)
    wx.hideLoading()
  },

  //获取工单信息
  getWkinfo: function(openid, id){
    try{
      const that = this
      var query = new wx.BaaS.Query()
      query.compare('openid', '=', openid)
      query.compare('_id', '=', id)
      MyTableObject.setQuery(query).find().then(res => {
        const wkList = res.data.objects
        if (wkList && wkList.length === 1) {
          const { date, priceMethod, labels, _id } = wkList[0]
          const _date = date.split("T")[0]

          let _priceMethod = "priceMethod"
          for (let i = 0; i < priceMethod.length; i++) {
            if (priceMethod[i].checked) {
              _priceMethod = priceMethod[i].value
              break
            }
          }
          let _labels = []
          for (let j = 0; j < labels.length; j++) {
            if (labels[j].checked) {
              _labels.push(labels[j].value)
            }
          }
          this.setData({
            ...wkList[0],
            _date,
            _priceMethod,
            _labels,
            images: wkList[0].fileIDs
          })
          that.getContactInfo(_id)
          console.log("data===>", this.data)
        } else {
          Notify({
            text: '获取工单信息失败',
            duration: 1000,
            backgroundColor: '#1989fa'
          });
        }
      }, err => {
        Notify({
          text: err,
          duration: 1000,
          backgroundColor: '#1989fa'
        });
      })
    } catch (err) {
      Toast("内部错误")
    }
  },

  //获取留言、电话信息
  getContactInfo: function (workflowId, page = 1, pageSize=5, type=null){
    try {
      wx.showNavigationBarLoading()
      var offset = pageSize * (page - 1)
      var query = new wx.BaaS.Query()
      query.compare('workflowId', '=', workflowId)
      ContactObject.setQuery(query).orderBy(['-updated_at', 'workId']).limit(pageSize).offset(offset).find().then(res=>{
        const dataList = res.data.objects
        const { total_count } = res.data.meta
        console.log("dataList===>", dataList)
        if (!dataList || dataList.length < 1){
          wx.hideNavigationBarLoading()
          return
        }
        let _dataList = []
        for (let i=0; i<dataList.length; i++){
          const { callTimes, context, phone, updated_at, workerAvatar, workerNickname} = dataList[i]
          console.log("updated_at==>", updated_at)
          const _updated_at = creatIimeHandle(updated_at)
          _dataList.push({
            callTimes, 
            context, 
            phone, 
            _updated_at, 
            workerAvatar, 
            workerNickname
          })
          console.log("_dataList==>", _dataList)
        }
        var leaveMsgInfo = []
        if (type='down'){
          leaveMsgInfo = this.data.leaveMsgInfo
        }
        _dataList.map(item=>leaveMsgInfo.push(item))
        //判断是否数据是否到底
        var end = true
        if (total_count <= page * pageSize) {
          end = false
        }

        this.setData({
          leaveMsgInfo,
          end,
        })
        wx.hideNavigationBarLoading()
      },err=>{
        wx.hideNavigationBarLoading()
        console.log("err", err)
        Toast("获取留言信息失败")
        return
      })
    } catch (err) {
      wx.hideNavigationBarLoading()
      console.log("err1", err)
      Toast("获取留言信息失败")
      return
    }
  },

  //点击图片展示大图
  handleImagePreview: function (e) {
    const idx = e.target.dataset.idx
    const images = this.data.images

    wx.previewImage({
      current: images[idx],
      urls: images,
    })
  },

  //结束工单
  finishClick: function (e) {
    let MyRecord = MyTableObject.getWithoutData(e.currentTarget.dataset.id)
    MyRecord.set('finish', true)
    MyRecord.set('status', '结束')
    MyRecord.update().then(res => {
      wx.redirectTo({
        url: '/pages/boss/workbench/workbench',
      })
    })
  },

  //修改工单
  changeClick: function (e) {
    wx.navigateTo({
      url: '/pages/boss/isform/isform?id=' + e.currentTarget.dataset.id,
    })
  },

  //到底部加载更多
  bindDownLoad: function () {
    //如果是向下划到底加载数据，判断是否上次加载完成的是否是否到底，到底的话不在去服务端请求
    console.log("hidden==>", this.data.end)
    if (!this.data.end) {
      return true
    }
    var page = this.data.page + 1
    this.getContactInfo(this.data._id, page, this.data.pageSize, "down")
  },

  //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
  scroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
})