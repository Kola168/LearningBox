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
      src: 'https://cdn-h.gongfudou.com/tmp/2019/10/25/e1acc050-0f65-11ea-a645-0bb7b7a5fdc4-out.jpg?x-image-process=image/resize,h_300/quality,Q_85/format,jpg',
      mode:'rectangle',
      sizeType: ['original'],
      maxLength: 2000, //限制最大像素为2500像素)
    })
    // this.ctx = ctx
  })
})