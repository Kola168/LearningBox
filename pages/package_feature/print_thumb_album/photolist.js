// pages/package_feature/print_thumb_album/photolist.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const upload = require('../../../utils/upload')
const imginit = require('../../../utils/imginit')
const event = require('../../../lib/event/event')

const showModal = util.promisify(wx.showModal)

import wxNav from '../../../utils/nav.js'
import getLoopsEvent from '../../../utils/worker'
import api from '../../../network/restful_request'
import commonRequest from '../../../utils/common_request'
import storage from '../../../utils/storage.js'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    //图片尺寸
    photoSize: {
      width: 450,
      height: 600
    },

    //图片数组
    imagesLength: 18,
    images: [],
    selectedImgIndex: 0, // 选中的图片index
    //图片尺寸
    imgSize: {},

    showProcess: false,
    completeCount: 0,
    count: 0,
    percent: 0,
    errTip: '',

    chooseCount: 1,
  },
  clickIndex: 0, //当前点击的idnex
  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.setData({
      images: Array(this.data.imagesLength).fill({})
    })
    this.type=options.type||'mini_album'
    this.calculateSize()
    this.getStorageImages()
    event.on('setPreData', this, (postData)=>{
      this.editPhoto(postData)
    })
  },

  onHide: function() {
    this.setStorage()
  },

  getStorageImages: function() {
    try {
      let galleryImages = storage.get(this.type)
      Loger(galleryImages)
      if (galleryImages) {
        this.setData({
          images: galleryImages.images,
        })
      }
    } catch (e) {
      Loger('获取本地图片失败')
    }
  },

  setStorage: function() {
    //图片存储至本地
    try {
      storage.put(this.type, {
        images: this.data.images
      })
    } catch (e) {
      Loger('图片存储到本地失败')
    }
  },
  onUnload: function() {
    event.remove('setPreData', this)
  },

  editPhoto:function(postData){
    this.longToast.toast({
      type: "loading",
    })
    this.setData({
      [`images[${postData.index}].url`]:postData.url
    })
    this.longToast.toast()
  },

  calculateSize: function() {

    let areaWidth = app.sysInfo.windowWidth - 100
    let areaHeight = (app.sysInfo.windowHeight - 65) * 0.38
    let photoScal = this.data.photoSize.width / this.data.photoSize.height
    let imgSize = {}
    if (photoScal > areaWidth / areaHeight) {
      imgSize.width = areaWidth
      imgSize.height = areaWidth / photoScal
    } else {
      imgSize.height = areaHeight
      imgSize.width = areaHeight * photoScal
    }
    imgSize.imgWidth = (app.sysInfo.windowWidth - (88 * app.sysInfo.windowWidth / 750)) / 6
    imgSize.imgHeight = imgSize.imgWidth / photoScal
    this.setData({
      imgSize: imgSize
    })
  },

  showCheck: function(e) {
    this.clickIndex = e.currentTarget.dataset.index
    let restImgArr = this.data.images.slice(this.clickIndex)
    let restCount = restImgArr.length - _.without(_.pluck(restImgArr, 'url'), undefined).length
    let count = restCount > 9 ? 9 : restCount
    this.setData({
      chooseCount: count
    })
    this.selectComponent("#checkComponent").showPop()
  },

  //取消照片上传
  cancelImg: co.wrap(function*() {
    app.cancelUpload = true
    this.setData({
      showProcess: false
    })
  }),

  chooseImgs: function(e) {
    let imgs = e.detail.tempFiles
    let that = this
    let paths = []
    try {
      _.each(imgs, function(value, index) {
        if (value.size < 20000000) {
          paths.push(value.path)
        }
      })
      Loger(paths)
      //没有可用图片列表时提示
      if (paths.length == 0) {
        this.setData({
          showProcess: true,
          errTip: '已为您过滤部分不适合打印的照片（大于20M)'
        })
        setTimeout(function() {
          that.setData({
            showProcess: false,
          })
        }, 5000)
      } else {
        app.cancelUpload = false
        this.setData({
          showProcess: true,
          count: paths.length
        })
        upload.uploadFiles(paths, function(index, path) {
          if (_.isNotEmpty(index) && _.isNotEmpty(path)) {
            that.setData({
              completeCount: index
            })
            that.showImage(path, index)
          } else {
            if (app.cancelUpload == true) {
              return
            }
            that.setData({
              showProcess: false
            })
            wx.showModal({
              title: '照片上传失败',
              content: '请检查网络或稍候再试',
              showCancel: false,
              confirmColor: '#FFE27A'
            })
          }
        }, function(process) {
          that.setData({
            percent: process
          })
        })
      }
    } catch (e) { Loger(e) }
  },

  baiduprint:co.wrap(function*(e){
    let imgs=e.detail
    this.setData({
      showProcess: true,
      count: imgs.length
    })
    let that=this
    _.each(imgs,function(value,index,list){
      index+=1
      that.setData({
        completeCount: index
      })
      that.showImage(value.url, index)
    })
  }),

  //展示图片
  showImage: co.wrap(function*(url, index) {
    try {
      let image
      let that = this
      let imaPath = yield imginit.imgInit(url, 'vertical')
      let localUrl = imaPath.imgNetPath
      let imageInfo = imaPath.imageInfo
      //大图过滤
      if (imageInfo.width / imageInfo.height > 5 || imageInfo.height / imageInfo.width > 5) {
        if (index == that.data.count) {
          that.setData({
            errTip: '已为您过滤部分不适合打印的照片（长宽比大于5)'
          })
          setTimeout(function() {
            that.setData({
              showProcess: false
            })
          }, 5000)
        }
        this.smallImgDelete = true
        return
      }

      image = {
        url: localUrl,
        localUrl: localUrl,
        width: imageInfo.width,
        height: imageInfo.height,
      }
      let imgIndex = Number(index-1) + Number(this.clickIndex)
      console.log(imgIndex,index,this.clickIndex)
      let insertIndex = _.findIndex(this.data.images.slice(imgIndex), function(value) {
        return value.url == undefined
      })
      console.log(insertIndex)
      if (insertIndex >= 0) {
        imgIndex += insertIndex
      }
      console.log(imgIndex)
      this.setData({
        [`images[${imgIndex}]`]:image,
        selectedImgIndex: this.clickIndex
      })
      //最后一张图结束清空隐藏进度条
      if (index == that.data.count) {
        that.setData({
          showProcess: false
        })
        if (this.smallImgDelete) {
          that.setData({
            showProcess: true,
            errTip: '已为您过滤部分不适合打印的照片（长宽比大于5)'
          })
          setTimeout(function() {
            that.setData({
              showProcess: false
            })
          }, 5000)
        }
        Loger('***图片处理结束，所有照片：***', that.data.photoList)
      }
    } catch (e) {
      Loger(e)
    }
  }),

  clickImg:function(e){
    let index=e.currentTarget.dataset.index
    this.setData({
      selectedImgIndex:index
    })
  },

  toEdit:function(e){
    let index = this.data.selectedImgIndex
    wxNav.navigateTo('/pages/package_feature/print_thumb_album/edit', {
      imgInfo: encodeURIComponent(JSON.stringify(this.data.images[index])),
      index: index,
      photoMedia: encodeURIComponent(JSON.stringify(this.data.photoSize)),
      mediaType:this.type
    })
  },

  deleteImg:co.wrap(function*(e){
    let that=this
    let deleteIndex=e.currentTarget.dataset.index
    console.log(e)
    wx.showModal({
      title: '提示',
      content: '确认删除此照片？',
      confirmColor: '#FFE27A',
      success:function(res){
        that.setData({
          [`images[${deleteIndex}]`]:{}
        })
      }
    })
  }),

  createOrder:co.wrap(function*(){
    if(_.without(_.pluck(this.data.images,'url'),undefined).length==0){
      return wx.showModal({
        title: '提示',
        content: '至少上传一张照片哦',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
    }
    this.setData({
      confirmModal: {
        isShow: true,
        title: '请参照下图正确放置台历打印纸',
        image: 'https://cdn-h.gongfudou.com/LearningBox/feature/thumb_album/mini_thumb_confirm_print.png'
      },
    })
  }),

  makeOrder:co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后',
    })
    try {
      let that=this
      _.each(this.data.images,function(value,index,list){
        if(value.url){
          list[index]={
            url:imginit.mediaResize(value.url,that.type),
          }
        }
      })
      let params={
        images:this.data.images,
        step_method:'two'
      }
      getLoopsEvent({
        feature_key: this.type,
        worker_data: params,

      }, co.wrap(function*(resp){
        Loger(resp)
        if (resp.status == 'finished') {
          that.longToast.hide()
          Loger(resp.data.url)
          let imgs = [{
            originalUrl: resp.data.url,
            printUrl: resp.data.url
          }]
          try{
            let orderSn = yield commonRequest.createOrder(that.type, imgs)
            storage.remove(that.type)

            wxNav.navigateTo(`/pages/finish/index`, {
              media_type: that.type,
              state:orderSn.createOrder.state
            })
            that.longToast.toast()
          }catch(e){
            that.longToast.toast()
            Loger(e)
            util.showError(e)
          }
        }
      }), ()=>{
        that.longToast.hide()
      })
    } catch (err) {
      Loger(err)
      this.longToast.hide()
      util.showError(err)
    }
  }),

})
