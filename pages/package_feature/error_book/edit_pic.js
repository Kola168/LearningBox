// pages/package_feature/error_book/edit_pic.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
} from '../../../utils/common_import'
import upload from '../../../utils/upload'
import router from '../../../utils/nav'
const device = wx.getSystemInfoSync()
const W = device.windowWidth - 40
const H = device.windowHeight * 0.7 - 100
const TOP = 140

Page({
  data: {
    croppers: null,
    // error_book:错题本首次上传图片
    // topic_details:错题详情页补充图片
    // photo_answer:拍搜
    type: '',
  },
  onLoad: co.wrap(function* (options) {
    this.options = options
    this.setData({
      type:options.type
    })
    console.log(options)
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
  rotateImage() {
    var ctx = this.selectComponent('#cropper')
    ctx.rotateImage()
  },
  cancel() {
    router.navigateBack()
  },
  //上传图片
  uploadImage: co.wrap(function* (tempUlr) {
    console.log('34567890-',this.options)
    this.longToast.toast({
      type: 'loading',
      duration: 0
    })
    let imgUrl = yield upload.uploadFile(tempUlr)
    this.longToast.hide()
    // this.hideCropper()

    switch (this.options.type) {
      case 'topic_details':
        let pages = getCurrentPages()
        let prevPage
        prevPage = pages[pages.length - 2]
        let urls = prevPage.data.urls
        urls.push(imgUrl)
        prevPage.setData({
          urls: urls
        })
        return router.navigateBack()
      case 'error_book':
        router.redirectTo(`/pages/package_feature/error_book/topic_details`, {
          url: imgUrl
        })
        break
      case 'photo_answer':
        router.redirectTo(`/pages/package_feature/error_book/answer_result`, {
          url: imgUrl,
          type:this.options.type
        })

    }
  })
})