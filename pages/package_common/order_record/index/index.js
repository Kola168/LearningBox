// pages/account/feedback.js
"use strict"

import graphql from '../../../../network/graphql/common'
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_common/order_record/index/index')
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
      const resp = yield graphql.getPaymentOrders()
      this.setData({
        orderList: resp.currentUser.paymentOrders,
        isEmpty: resp.currentUser.paymentOrders && !resp.currentUser.paymentOrders.length
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
      dataset: {
        sn
      }
    }
  }) {
    try {
      wxNav.navigateTo('../order/order', {
        sn
      })
    } catch (err) {
      logger.info(err)
    }
  },

  backToHome: function () {
    wxNav.switchTab('/pages/index/index')
  },

  onShareAppMessage: function () {
    return app.share
  }
})