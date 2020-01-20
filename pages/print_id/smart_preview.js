// pages/idprint/preview.js
"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const _ = require('../../lib/underscore/we-underscore')
const imginit = require('../../utils/imginit')
import api from '../../network/restful_request.js'
import router from '../../utils/nav'
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import {
  wxNav
} from '../../utils/common_import.js'


const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const requestPayment = util.promisify(wx.requestPayment)
// import graphql from '../../utils/graphql_request'

Page({
  data: {
    singleImg: '',
    print_wm_url: '',
    payImage: '',
    idPrint: true,
    number: 1,
    pay: false,
    type: '',
    price_count: 0,
    price: 0,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请确认6寸照片纸放置正确',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print.png'
    },
    saveTip: true,
    isMember: false,
    hasPay: false
  },
  onShareAppMessage: function () {
    return app.share
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    this.query = JSON.parse(options.params)

    logger.info('预览页参数', this.query)
    this.setData({
      singleImg: this.query.wm_url,
      print_wm_url: this.query.print_wm_url ? imginit.addProcess(this.query.print_wm_url, '/rotate,90') : ''
    })
    // if (this.query.print_wm_url == null) {
    //   this.setData({
    //     idPrint: false
    //   })
    // }
    if (this.query.orderSn && this.query.hasPay==true) {
      this.setData({
        hasPay: true
      })
    }
  }),
  onShow: function () {
    let hasAuthPhoneNum = Boolean(wx.getStorageSync('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },
  preview: function () {
    wx.previewImage({
      urls: [this.data.singleImg]
    })
  },
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
  toPay(e) {
    try {
      let type = e.currentTarget.id
      router.redirectTo('/pages/print_id/pay', {
        params: JSON.stringify(this.query),
        type: type
      })
    } catch (error) {
      console.log(error)
    }
  },
  toPrint() {
    wxNav.redirectTo('/pages/print_id/print', {
      url: JSON.stringify(this.query.print_wm_url),
      sn: this.query.orderSn,
      hasPay:true
    })
  },
  toSave() {
    wxNav.redirectTo('/pages/print_id/smart_save', {
      params: JSON.stringify(this.query),
      hasPay:true
    })
  },
  closeTip() {
    this.setData({
      saveTip: false
    })
  }
})