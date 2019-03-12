import { promisify } from '../../../lib/utils/promise.js'
import Notify from '../../../lib/style/vant-weapp/dist/notify/notify'
let MyFile = new wx.BaaS.File()
const wxUploadFile = promisify(MyFile.upload)
var MyTableObject = new wx.BaaS.TableObject('workflow')
var app = getApp();

Page({
  data: {
    workType: "",
    priceMethod: [
      { name: 'hour', value: '包时', checked: true  },
      { name: 'contract', value: '包工', checked: false},
    ],
    labels: [
      { id: 'gongzhuang', value: '工装', checked: false, type: "defalut" },
      { id: 'jiazhuangxinfang', value: '家装新房', checked: false, type: "defalut" },
      { id: 'jiazhuangjiufang', value: '家装旧房', checked: false, type: "defalut" },
      { id: 'zizhuang', value: '自装', checked: false, type: "defalut" },
      { id: 'rijie', value: '日结', checked: false, type: "defalut" },
      { id: 'wangongjie', value: '完工结', checked: false, type: "defalut" },
      { id: 'identitycard', value: '需要身份证项品办理物业手续', checked: false, type: "defalut" },
    ],
    countryCodes: ["+86", "+80", "+84", "+87"],
    countryCodeIndex: 0,

    countries: ["中国", "美国", "英国"],
    countryIndex: 0,

    chargeType: 'hour',
    bargain: true,
    region: ['北京市', '北京市', '东城区'],
    date: '2018-11-20',
    images: [],
    isAgree: false
  },
  onLoad: function (options) {
    if (options.id){
      console.log(options.id)
      var query = new wx.BaaS.Query()
      query.compare('_id', '=', options.id)
      MyTableObject.setQuery(query).find().then(res => {
        console.log(res)
        const wkInfo = res.data.objects
        if (wkInfo.length === 1){
          const date = wkInfo[0].date.split("T")[0]
          const images = wkInfo[0].fileIDs
          console.log(images)
          this.setData({
            ...wkInfo[0],
            date,
            images
          })
        }else{
          Notify({
            text: '获取工单信息失败',
            duration: 1000,
            backgroundColor: '#1989fa'
          });
        }
      })
      return true
    }
    // 頁面初始化 options為頁面跳轉所帶來的參數
    this.setData({
      workType: options.workType
    })
    const title = "发布-" + options.workType
    wx.setNavigationBarTitle({
      title: title
    })
  },
  radioChange: function (e) {
    var priceMethod = this.data.priceMethod
    for (let item of priceMethod){
      if (e.detail.value===item.name){
        item.checked = true
      }else{
        item.checked = false
      }
    }
    this.setData({
      priceMethod,
      chargeType: e.detail.value
    })
    console.log('radio发生change事件，携带value值为：', this.data.priceMethod)
  },
  switch1Change: function (e) {
    this.setData({
      bargain: e.detail.value,
    })
    console.log("bargain==>", this.data.bargain)
  },
  bindFormDataUpdate: function (e) {
    console.log(e)
    const Int_colum = ['days', 'people']
    var key = e.currentTarget.id
    let value = e.detail.value
    if (Int_colum.indexOf(key) !== -1){
      console.log("key==>", key)
      value = parseInt(value)
    }
    this.setData({
      [key]: value
    })
  },

  bindCountryCodeChange: function (e) {
    this.setData({
      countryCodeIndex: e.detail.value
    })
  },

  bindMarkChecked: function(e) {
    var id = e.currentTarget.id
    var labels = this.data.labels
    for (let item of labels){
      if (id===item.id){
        var checked = item.checked  ? false : true
        var _type = checked ? "warn" : "default"
        item.checked = checked
        item.type = _type
        break
      }
    }
    this.setData({
      labels
    })
  },

  //本地上传图片
  chooseImage: function(e) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        console.log("fileInfo==>", res)
        const images = this.data.images.concat(res.tempFilePaths)
        this.data.images = images.length <= 7 ? images : images.slice(0, 7)
        this.setData({
          images: this.data.images
        })
      }
    })
  },
  //点击图片展示大图
  handleImagePreview: function(e) {
    const idx = e.target.dataset.idx
    const images = this.data.images

    wx.previewImage({
      current: images[idx],
      urls: images,
    })
  },
  //长按删除图片
  deleteImage: function (e) {
    var that = this;
    var images = that.data.images;
    var index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('点击确定了');
          images.splice(index, 1);
        } else if (res.cancel) {
          console.log('点击取消了');
          return false;
        }
        that.setData({
          images
        });
      }
    })
  },

  //提交表单，包括文件真实上传到服务器
  submitForm(e) {
    //获取openid
    const openid = wx.getStorageSync('openid')
    const uid = wx.getStorageSync('uid')
    if (!openid || !uid){
      console.log("获取用户信息失败")
      return
    }

    const arr = []
    for (let path of this.data.images) {
      const fileName = path.split(".").slice(-2,).join(".")
      console.log("fileName==>", fileName)
      arr.push(wxUploadFile(
        { filePath: path},
        { categoryName: 'jingong'}
      ))
    }

    wx.showLoading({
      title: '正在创建...',
      mask: true
    })

    Promise.all(arr).then(res => {
      return res.map(item => item.path)
    }).catch(err => {
      console.log(">>>> upload images error:", err)
      return
    }).then(fileIDs => {
      const data = {
        priceMethod: this.data.priceMethod,
        chargeType: this.data.chargeType,
        pay: this.data.pay,
        days: this.data.days,
        people: this.data.people,
        region: this.data.region,
        address: this.data.address,
        date: this.data.date,
        phoneNumber: this.data.phoneNumber,
        remark: this.data.remark,
        labels: this.data.labels,
        fileIDs: fileIDs,
        finish: false,
        workType: this.data.workType,
        openid: openid,
        uid: uid,
        status: '进行中'
      }
      console.log("data==>", data)
      let MyTableObject = new wx.BaaS.TableObject('workflow')
      let MyRecord = MyTableObject.create()
      MyRecord.set(data).save().then(res=>{
        wx.hideLoading()
        wx.redirectTo({
          url: "/pages/boss/workbench/workbench",
        })
      },err=>{
        wx.hideLoading()
        console.log('err=>', err)
      })
    })
  },

  //条款协议同意
  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  }
  
})