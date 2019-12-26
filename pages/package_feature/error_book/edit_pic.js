// pages/package_feature/error_book/edit_pic.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../../utils/common_import'
import upload from '../../../utils/upload'
import router from '../../../utils/nav'
const imginit = require('../../../utils/imginit')
import common_request from '../../../utils/common_request'
import modal from '../../../components/confirm-reinforce-modal/event'
import getLoopsEvent from '../../../utils/worker'
import event from '../../../lib/event/event'
const device = wx.getSystemInfoSync()
const W = device.windowWidth - 40
const H = device.windowHeight * 0.7 - 100
const TOP = 140

Page({
  data: {
    croppers: null,
    // error_book:错题本首次上传图片
    // topic_details:错题详情页补充图片
    // photoAnswer:拍搜
    from: '',
  },
  onLoad: co.wrap(function* (options) {
    this.options = options
    this.longToast = new app.weToast()
    this.setData({
      croppers: {
        tempInfo: {
          width: W,
          height: H,
          top: TOP,
          left: 20
        },
        mode: 'rectangle'
      }
    })
    var ctx = this.selectComponent('#cropper')
    ctx.startCropper({
      src: options.url,
      // src: 'https://cdn-h.gongfudou.com/tmp/2019/10/25/e1acc050-0f65-11ea-a645-0bb7b7a5fdc4-out.jpg?x-image-process=image/resize,h_300/quality,Q_85/format,jpg',
      mode: 'rectangle',
      sizeType: ['original'],
      maxLength: 2000, //限制最大像素为2500像素)
    })
    this.ctx = ctx
  }),
  cropImage() {
    // tempFilePath = this.options.url
    this.ctx.cropImage((res) => {
      // if (mode == "rectangle") {
      this.uploadImage(res)
      // } else {
      //   this.utilsPic({
      //     origin_url: tempFilePath,
      //     data: res,
      //   })
      // }
    })
  },
  rotateImage(){
    var ctx = this.selectComponent('#cropper')
    ctx.rotateImage()
  },
  cancel(){
    router.navigateBack()
  },
  //上传图片
  uploadImage: co.wrap(function* (tempUlr) {
      this.longToast.toast({
        type: 'loading',
        duration: 0
      })
      let imgUrl = yield upload.uploadFile(tempUlr)
      this.longToast.hide()
      // this.hideCropper()
  
    //再次编辑、上传多张图
    if (this.options.from == 'topic_details') {
      let pages = getCurrentPages()
      let prevPage
      prevPage = pages[pages.length - 2]
      let urls = prevPage.data.urls
      urls.push(imgUrl)
      prevPage.setData({
        urls: urls
      })
      return router.navigateBack()
    } else {
      router.redirectTo(`/pages/package_feature/error_book/topic_details`, {
        url: imgUrl
      })
    }
  })
})