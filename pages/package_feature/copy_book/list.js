"use strict"
const app = getApp()

import {
  regeneratorRuntime,
  co,
  util,
  _,
  common_util
} from '../../../utils/common_import'

const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const requestPayment = util.promisify(wx.requestPayment)
import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql/feature'

Page({
  data: {
    showConfirmModal: false,
    highScreen: false
  },

  onLoad: co.wrap(function*(options) {
    this.longToast = new app.WeToast()
    mta.Page.init()
    console.log(options)
    this.setData({
      title: options.title,
    })

    this.setData({
      // user_share_qrcode: common_util.decodeLongParams(options.user_share_qrcode),
      title: options.title,
      sn: options.sn,
      highScreen: app.isFullScreen
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
      type:'loading'
    })
    try {
      const resp = yield api.copybooksetsDetail(app.openId, this.data.sn)
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('获取字帖集详情', resp)
      this.setData({
        copyBooks: resp.res.copy_books,
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
