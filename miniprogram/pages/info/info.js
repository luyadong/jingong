// miniprogram/pages/info/info.js
import { promisify } from '../../lib/utils/promise.js'
var i = 60;
//全局中取出openid 
var openid = wx.getStorageSync("openid")
var ucTable = new wx.BaaS.TableObject("uc")
let MyFile = new wx.BaaS.File()
const wxUploadFile = promisify(MyFile.upload)

var recordID = ""
Page({

  /**
   * 页面的初始数据
   */
  data: {
    steps: [
      {
        text: '手机认证'
      },
      {
        text: '证件上传'
       
      },
      {
        text: '认证审核'
      }
    ],
    active:0, //进度
    phone:"",
    isPhone:false,
    btnName:"获取验证码",
    isClick:true,
    code:"",
    isRight:false,
    handcard:"",
    card:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      //根据用户openid来查询用户的验证状态
    
    let query = new wx.BaaS.Query()
    query.compare("openid","=",openid)

    ucTable.setQuery(query).find().then(res => {
      // success
      var objs = res.data.objects

      if (objs&&objs.length===1){
        //有这个openid的信息，说明已经认证成功
        if(objs[0].status==="1"){
          recordID = objs[0].id
          console.log("recordID============"+recordID)
          this.setData({active:1})
        }else{
          this.setData({ active: 2 })
        }

      }


    }, err => {
      // err
    })  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

      console.log("active的值"+this.data.active)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getSms:function(){
    var that = this;

    if(this.data.isClick){

      if (this.data.isPhone) {
        wx.BaaS.sendSmsCode({ phone: this.data.phone }).then(res => {
          // success
          console.log(res.data) // { "status": "ok" }
        }).catch(e => {
          // err
          console.log(e.code) // 错误状态码
        })

        this.setData({ isClick: false })
        this.timeGo()
      } else {
        wx.showToast({
          title: '手机号有误',
          icon: 'warn',
          duration: 2000
        })
      }
    }
    

    
  },
  timeGo:function(){
    
    i = i-1
    this.setData({
      btnName: "("+i+")秒后重取"
    })

    if(i==0){
      this.setData({
        btnName: "获取验证码",
        isClick:true
      })
      i = 60
      return;
    }
    setTimeout(this.timeGo, 1000)

  },
  blurPhone:function(e){

    let value = e.detail.value;
    if (!(/^1[34578]\d{9}$/.test(value))) {
      this.setData({
        isPhone: false
      })

      if (value.length>=11){
        wx.showToast({
          title: '手机号有误',
          icon: 'success',
          duration: 2000
        })
      }
    }else{
      this.setData({
        phone:value,
        isPhone: true
      })

    }

  },
  checkSms:function(e){
    //用户输入的验证码
    var value = e.detail.value

    wx.BaaS.verifySmsCode({ phone: this.data.phone, code: value }).then(res => {
      // success
      this.setData({isRight: true })
      console.log(res.data) // { "status": "ok" }
    }).catch(e => {
      // err
      console.log(e.code) // 错误状态码

      this.setData({ code: "" })
      
      if(isPhone){
        wx.showToast({
          title: '验证码错误',
          icon: 'success',
          duration: 2000
        })
      }
     
    })

  },
  next:function(){
    if(this.data.active==0){
      if (this.data.isRight) {
        //验证码验证成功
        let newRecord = ucTable.create()

        newRecord.set({
          "openid": openid,
          "phone": this.data.phone,
          "status": "1"
        })

        newRecord.save().then(
          res => {
            // success
            console.log(res)
            this.setData({active:1})
          }, err => {
            // HError 对象
          }
        )
      }
    } else if (this.data.active==1){

      if (this.data.handcard != "" && this.data.card!=""){
        var images = {
          handfileid: this.data.handcard,
          fileid: this.data.card
        }

        let MyRecord = ucTable.getWithoutData(recordID)
        Object.keys(images).forEach(function(key){

          console.log(key, images[key]);

          let fileParams = { filePath: images[key][0] }
          let metaData = { categoryName: 'jingong' }

          wxUploadFile(fileParams, metaData).then(res =>{
            console.log("key================"+key)
           
            MyRecord.set(key,res.file.id)
            MyRecord.update().then(res => {
              // success
            }, err => {
              // err
            })
          })
        })
        MyRecord.set("status", "2")
        MyRecord.update().then(res => {
          this.setData({"active":2})
        }, err => {
          // err
        })
      
      }else{
        wx.showToast({
          title: '图片未上传',
          icon: 'success',
          duration: 2000
        })

      }
        

    }else{


    }
   

  },
  //本地上传图片
  chooseImage: function (e) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        console.log("fileInfo==>", res)
        if(e.currentTarget.dataset.fileType==="handcard"){

          this.setData({
            handcard: res.tempFilePaths
          })
        }else{
          this.setData({
            card: res.tempFilePaths
          })
        }
       
      }
    })
  },  //点击图片展示大图
  handleImagePreview: function (e) {
   
    const imgUrl = this.data.handcard
    wx.previewImage({
      urls: imgUrl
    })
  },
  //长按删除图片
  deleteImage: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('点击确定了');

          if(e.currentTarget.dataset.fileType==="handcard"){
            that.setData({handcard:""})

          } else if (e.currentTarget.dataset.fileType === "card"){

            that.setData({ card: "" })
          }
         
        } else if (res.cancel) {
          console.log('点击取消了');
          return false;
        }
       
      }
    })
  }
 
  


})