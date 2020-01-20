const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../utils/common_import.js'
import api from '../../network/restful_request.js'
import commonRequest from '../../utils/common_request'
import memberGql from '../../network/graphql/member'
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
const event = require('../../lib/event/event')
const imginit = require('../../utils/imginit')
import gql from '../../network/graphql_request.js'

Page({
  data: {
    number: 1,
    confirmModal: {
      isShow: false,
      title: '请确认6寸照片纸放置正确',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print.png'
    }
  },

  onLoad: co.wrap(function* (options) {
    try {
      this.longToast = new app.weToast()
      console.log('打印页参数', options,options.hasPay)
      let url = JSON.parse(options.url)
      url = imginit.addProcess(url, '/rotate,90')
      this.setData({
        url,
        sn: options.sn
      })
      if(options.hasPay!='true'){
        yield this.getWorkerSn()
      }
    } catch (error) {
      console.log(error)
    }

  }),
  tapMin: co.wrap(function* () {
    if (this.data.number > 1) {
      this.setData({
        number: this.data.number - 1,
        price_count: ((this.data.number - 1) * this.data.price).toFixed(2)
      })
    }
  }),
  tapPlus: co.wrap(function* () {
    if (this.data.number < 50) {
      this.setData({
        number: this.data.number + 1,
        price_count: ((this.data.number + 1) * this.data.price).toFixed(2)
      })
    }
  }),
  getWorkerSn: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后'
    })
    try {
      let resp = yield gql.certService(this.data.sn)
      if (resp.certService.url == '') {
        setTimeout(() => {
          this.getWorkerSn()
        }, 3000)
        return
      } else if (resp.certService.url) {
        console.log('23456789o0p', resp)
        this.longToast.hide()
        let url = imginit.addProcess(resp.certService.url, '/rotate,90')
        this.setData({
          url
        })
      }
    } catch (e) {
      util.showError(e)
    }
  }),
  toConfirm() {
    let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.print()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  },

  print: co.wrap(function* () {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    // 提交制作信息
    try {
      var param = [{
        originalUrl: this.data.url, //  用户上传的原文件
        printUrl: this.data.url, // 编辑后可打印的连接
        copies: this.data.number, // 打印份数
        grayscale: false, // 是否使用灰度打印
      }]
      const resp = yield commonRequest.createOrder('cert_id', param)
      wxNav.redirectTo('/pages/finish/index', {
        type: 'cert_id',
        media_type: 'cert_id',
        state: resp.createOrder.state,
        url: encodeURIComponent(this.data.url)
      })
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
      return null
    }
  }),
  onShareAppMessage() {

  }
})