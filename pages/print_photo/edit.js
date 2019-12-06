// pages/print_photo/edit.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const _ = require('../../lib/underscore/we-underscore')
const util = require('../../utils/util')
const event = require('../../lib/event/event')

const request = util.promisify(wx.request)

import wxNav from '../../utils/nav.js'
import api from '../../network/restful_request'

let Loger=(app.apiServer=='https://epbox.gongfudou.com'||app.deBug)?function(){}:console.log

Page({

  data: {
    templateInfo: [],
    paperSize: {},
    photoPath: '',
    butHigh: false, //底部按钮是否拔高
  },

  onLoad: function(options) {
    Loger(options)
    this.longToast = new app.weToast()
    let imgInfo = JSON.parse(decodeURIComponent(options.imgInfo))
    this.index = options.index
    this.mediaInfo = JSON.parse(decodeURIComponent(options.photoMedia))
    this.mediaType = options.mediaType
    this.setData({
      photoPath: imgInfo.localUrl,
      paperSize: {
        width: this.mediaInfo.width,
        height: this.mediaInfo.height,
        heightPer: 0.666,
        minLeftHeight: 260,
        sider: 220,
      },
      templateInfo: {
        modeSize: {
          x: 0,
          y: 0,
          width: this.mediaInfo.width,
          height: this.mediaInfo.height,
          areaWidth: this.mediaInfo.width,
          areaHeight: this.mediaInfo.height,
        }
      }
    })
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    }
  },
  confEdit: co.wrap(function*() {
    try {
      this.longToast.toast({
        type: "loading",
      })
      let params = this.selectComponent("#mymulti").getImgPoint()[0] //页面调用组件内方法
      const resp = yield api.processes({
          is_async: false,
          editor_scale: params.editor_scale,
          image_url: params.image_url,
          feature_key: this.mediaType,
          rotate: params.rotate,
          scale: params.scale,
          x: params.x,
          y: params.y,
          image_width:params.image_width,
          image_height:params.image_height
      })
      event.emit('setPreData', {url:resp.res.url,index:this.index})
      wxNav.navigateBack()
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      wx.showModal({
        title: '合成出错',
        content: '请检查网络连接',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
      Loger(e)
    }
  }),
})
