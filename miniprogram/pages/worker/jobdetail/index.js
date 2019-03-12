import { creatIimeHandle } from '../../../lib/utils/common.js'
var app = getApp();
var MyTableObject = new wx.BaaS.TableObject('workflow')

Page({
  data: {},

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "工单详情"
    })
    //设置列表显示的宽度和高度
    const res = wx.getSystemInfoSync()
    const windowWidth = res.windowWidth
    var scrollHeight = res.windowHeight - 60
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
    var query = new wx.BaaS.Query()
    query.compare('_id', '=', id)
    MyTableObject.setQuery(query).find().then(res => {
      const wkList = res.data.objects
      if (wkList && wkList.length === 1) {
        console.log("workList==>", wkList[0])
        const { date, priceMethod, labels, region, address, created_at } = wkList[0]
        const _date = date.split("T")[0]
        const _created_at = creatIimeHandle(created_at)
        console.log("_created_at==>", _created_at)
        let _labels = []
        for (let j = 0; j < labels.length; j++) {
          if (labels[j].checked) {
            _labels.push(labels[j].value)
          }
        }
        let _address = ''
        if (region.length > 0){
          region.map(item=>_address+=item)
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
        console.log(this.data)
      } else {
        Notify({
          text: '获取工单信息失败',
          duration: 1000,
          backgroundColor: '#1989fa'
        });
      }
      wx.hideLoading()
    }, err => {
      Notify({
        text: err,
        duration: 1000,
        backgroundColor: '#1989fa'
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

})