// pages/idprint/preview.js
"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const _ = require('../../lib/underscore/we-underscore')
const imginit=require('../../utils/imginit')
import api from '../../network/restful_request.js'

const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const requestPayment = util.promisify(wx.requestPayment)
// import graphql from '../../utils/graphql_request'

Page({
  data: {
    singleImg: '',
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
    isMember: false
  },
  onShareAppMessage: function () {
    return app.share
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    //下面的是worker sn
    this.query = JSON.parse(options.confirm)
    this.info = JSON.parse(options.info)

    this.setData({
      price_count: this.query.price,
      price: this.query.price,
      can_free_print: this.query.can_free_print ? this.query.can_free_print : false
    })
    if (this.query.url_print_wm == null) {
      this.setData({
        idPrint: false
      })
    }
    let res = yield graphql.isMember()
    this.setData({
      isMember: res.user != null && res.user.isMember ? res.user.isMember : false
    })
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
  //打印为纸质版
  toPrint: co.wrap(function* (e) {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }
    if (!this.data.idPrint) {
      yield showModal({
        content: '当前类型只支持电子照保存哦',
        showCancel: false,
        confirmColor: '#fae100'
      })
      return
    }
    this.setData({
      singleImg: imginit.addProcess(this.query.url_print_wm , '/rotate,90'),
      pay: true,
      type: e.currentTarget.id
    })

  }),
  getPhoneNumber: co.wrap(function* (e) {
    yield app.getPhoneNum(e)
    wx.setStorageSync("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.toPrint(e)
  }),
  toSavePay: function (e) {
    this.setData({
      pay: true,
      type: e.currentTarget.id
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
  //提交订单
  submit: co.wrap(function* (e) {
		if (app.preventMoreTap(e)) {
      return
    }
    let brand
    this.longToast.toast({
      img: '../../images/loading.gif',
      title: '请稍候',
      duration: 0
    })
    let p = {
      order_sn: this.query.sn,
      openid: app.openId,
      number: this.data.number,
      save_as: this.data.type,
      type: 'identification'
    }
    try {
      const resp = yield request({
        // url: app.apiServer + `/ec/v2/payments`,
        url: app.apiServer + `/boxapi/v2/payments`,
        header: {
          'G-Auth': app.gAuthAppKey
        },
        method: 'POST',
        dataType: 'json',
        data: p
      })
      if (resp.data.code == 0) {
        if (resp.data.res.free_to_print == true) {
          return wx.redirectTo({
            url: `../finish/index?type=${this.data.type}&id=${this.query.sn}`
          })
        }
        brand = resp.data.res
        console.log('brand-----', resp.data.res)
      } else {
        this.longToast.toast()
        // 其他错误
        yield showModal({
          title: '提示',
          content: resp.data.message,
          showCancel: false,
          confirmColor: '#fae100'
        })
        return
      }
    } catch (e) {
      this.longToast.toast()
      yield showModal({
        title: '网络异常',
        content: '请检查您的手机网络后重试',
        showCancel: false,
        confirmColor: '#fae100'
      })
      return
    }
    this.longToast.toast()
    if (brand && this.data.can_free_print) {
      this.setData({
        can_free_print: false
      })
      yield showModal({
        title: '温馨提示',
        content: '该设备今日免费打印次数已用完',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
    }
    try {
      const payment = yield requestPayment({
        timeStamp: brand.timeStamp,
        nonceStr: brand.nonceStr,
        package: brand.package,
        signType: brand.signType,
        paySign: brand.paySign
      })
      console.log('支付信息=========', payment)

      return wx.redirectTo({
        url: `../finish/index?type=${this.data.type}&id=${this.query.sn}`
      })
    } catch (e) {
      console.log(e)
    }
  }),

  //打印
  print: function () {
    let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.submit()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  },
})
