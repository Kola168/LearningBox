"use strict"
const app = getApp()

import api from '../../../../network/api'
import {
  regeneratorRuntime,
  co,
  util,
  _,
  uploadFormId,
  common_util
} from '../../../../utils/common_import'

const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const requestPayment = util.promisify(wx.requestPayment)
var mta = require('../../../../utils/mta_analysis.js')

Page({
  data: {
    showConfirmModal: false,
    highScreen: false
  },

  onLoad: co.wrap(function*(options) {
    this.longToast = new app.WeToast()
    mta.Page.init()
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.title,
    })

    this.setData({
      user_share_qrcode: common_util.decodeLongParams(options.user_share_qrcode),
      title: options.title,
      sn: options.sn,
      choose_grade: options.choose_grade,
      price: options.price,
      highScreen: app.sysInfo.screenHeight > 750 ? true : false
    })
    yield this.getcopybookSets()
  }),

  toPay: co.wrap(function*(e) {
    let sn = this.data.sn
    mta.Event.stat("zitie_pay_button", sn)
    this.setData({
      showConfirmModal: true
    })
  }),

  getcopybookSets: co.wrap(function*(e) {
    this.longToast.toast({
      img: '/images/loading.gif',
      title: '请稍候',
      duration: 0
    })
    try {
      const resp = yield api.copybooksetsDetail(app.openId, this.data.sn)
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('获取字帖集详情', resp)
      this.setData({
        copyBooks: resp.res.copy_books,
        user_paid: resp.res.user_paid,
        free: resp.res.free
      })
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  cancel: co.wrap(function*(e) {
    this.setData({
      showConfirmModal: false
    })
  }),

  confirm: co.wrap(function*(e) {
    let sn = this.data.sn
    mta.Event.stat("zitie_pay_confirm", sn)
    this.longToast.toast({
      img: '/images/loading.gif',
      title: '请稍候',
      duration: 0
    })
    this.setData({
      showConfirmModal: false
    })
    let brand
    try {
      const resp = yield api.payCopybook(app.openId, 'copy_book_set', this.data.sn)
      if (resp.code != 0) {
        throw (resp)
      }
      brand = resp.res
      console.log('brand-----', resp.res)
      console.log('购买成功', resp)
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
    const payment = yield requestPayment({
      timeStamp: brand.timeStamp,
      nonceStr: brand.nonceStr,
      package: brand.package,
      signType: brand.signType,
      paySign: brand.paySign
    })
    console.log('支付信息=========', payment)
    this.setData({
      user_paid: true,
    })
  }),

  toDetail: co.wrap(function*(e) {
    let id = e.currentTarget.id
    let name = this.data.copyBooks[id].name
    let sn = this.data.copyBooks[id].sn
    mta.Event.stat("zitie_list_print", sn)
    wx.navigateTo({
      url: `detail?title=${this.data.title}&name=${name}&sn=${sn}&user_share_qrcode=${common_util.encodeLongParams(this.data.user_share_qrcode)}`,
    })

  })
})