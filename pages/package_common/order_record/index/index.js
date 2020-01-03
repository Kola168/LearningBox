// pages/account/feedback.js
"use strict"

import graphql from '../../../../utils/graphql_request'
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
Page({
  data: {
    isEmpty: false,
    orderList: [],
    canSave: false
  },
  onLoad: function (options) {
    this.longToast = new app.weToast()
  },
  onShow: function () {
    this.getOrder()
  },
  // 获取订单数据
  getOrder: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      const resp = yield graphql.getOrderRecords()
      this.setData({
        orderList: resp.payments,
        isEmpty: !resp.payments.length
      })
    } catch (err) {
      util.showError(err)
    } finally {
      this.longToast.toast()
    }
  }),
  // 跳转订单详情
  toOrder: function ({
    currentTarget: {
      id
    }
  }) {
    try {
      var order = this.data.orderList[id]
      wxNav.navigateTo('../order/order', {
        sn: order.sn
      })
    } catch (err) {
      console.error(err)
    }
  },

  backToHome: function () {
    wxNav.switchTab('/pages/index/index')
  },

  onShareAppMessage: function () {
    return app.share
  }
})