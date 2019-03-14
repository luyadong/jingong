import { creatIimeHandle } from '../../../lib/utils/common.js'
import Notify from '../../../lib/style/vant-weapp/dist/notify/notify'
import Dialog from '../../../lib/style/vant-weapp/dist/dialog/dialog'
import Toast from '../../../lib/style/vant-weapp/dist/toast/toast'
var app = getApp();
var WorkFlowObject = new wx.BaaS.TableObject('workflow')
var ContactObject = new wx.BaaS.TableObject('contact')

Page({
  data: {
    leaveMsgShow: false,
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "工单详情"
    })
    //设置列表显示的宽度和高度
    const res = wx.getSystemInfoSync()
    const windowWidth = res.windowWidth
    var scrollHeight = res.windowHeight - 40
    this.setData({
      scrollHeight: scrollHeight,
      windowWidth: windowWidth
    })
    const id = options.id
    if (!id) {
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
    this.queryWkInfo(id)
    wx.hideLoading()
  },

  //获取工单信息
  queryWkInfo: function(id) {
    var query = new wx.BaaS.Query()
    query.compare('_id', '=', id)
    WorkFlowObject.setQuery(query).find().then(res => {
      const wkList = res.data.objects
      if (wkList && wkList.length === 1) {
        const { date, priceMethod, labels, region, address, created_at, uid } = wkList[0]
        //获取发单用户头像和名称
        this.queryBossInfo(uid)
        //数据处理
        const _date = date.split("T")[0]
        const _created_at = creatIimeHandle(created_at)
        let _labels = []
        for (let j = 0; j < labels.length; j++) {
          if (labels[j].checked) {
            _labels.push(labels[j].value)
          }
        }
        let _address = ''
        if (region.length > 0) {
          region.map(item => _address += item)
        }
        _address = _address + address
        this.setData({
          ...wkList[0],
          _date,
          _labels,
          images: wkList[0].fileIDs,
          _address,
          _created_at
        })
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
  },

  //获取发单人信息
  queryBossInfo: function(uid) {
    let MyUser = new wx.BaaS.User()
    MyUser.get(uid).then(res=>{
      const data = res.data
      this.setData({
        Boss_avatar: data.avatar,
        Boss_nickname: data.nickname
      })
    }, err=>{
      Notify({
        text: err,
        duration: 1000,
        backgroundColor: 'red'
      });
    })
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

  //工单留言页面弹出
  leaveMsgClick: function(){
    this.setData({
      leaveMsgShow: true
    })
  },

  //工单留言界面操作
  leaveMsgClose: function(event){
    try {
      if (event.detail === 'confirm') {
        const uid = wx.getStorageSync('uid')
        if (!uid) {
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none',
          })
          return
        }
        const data = {
          workId: uid,
          context: this.data.leaveMsg,
          workflowId: this.data._id
        }
        wx.showLoading({
          title: '正在加载...',
          mask: true
        })
        let contactRecord = ContactObject.create()
        contactRecord.set(data).save().then(res=>{
          Notify({
            text: '留言成功',
            duration: 1000,
            backgroundColor: '#1989fa'
          });
          wx.redirectTo({
            url: "/pages/worker/jobdetail/index?id=" + this.data._id,
          })
        },err=>{
          Notify({
            text: '留言失败',
            duration: 1000,
            backgroundColor: 'red'
          });
        })
        wx.hideLoading()
        
      } else {
        this.setData({
          leaveMsgShow: false
        });
      }
    } catch (err) {
      console.log("err==>",err)
      Toast("内部错误")
    }
  },

  //留言数据更新
  leaveMsgChange: function(e){
    this.setData({
      leaveMsg: e.detail
    })
  },

  //打电话确认
  callPhoneClick: function(e){
    Dialog.confirm({
      title: '温馨提示',
      message: '1、请提示工长关闭订单，避免接单重复\n2、请不要放鸽子，已经发现，无条件封号。'
    }).then(() => {
      console.log(e)
      const phoneNumber = this.data.phoneNumber
      wx.makePhoneCall({
        phoneNumber: phoneNumber,
        success(res){
          console.log(res)
        },
        fail(err){
          console.log(err)
        }
      })
    }).catch(() => {
      console.log(e)
    });
  }

})