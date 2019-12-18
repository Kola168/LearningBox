"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'
Page({
  data: {
    order: null
  },
  onLoad: function(query) {
    this.weToast = new app.weToast()
    this.sn = query.sn
    this.getPrinterRecordDetail()
  },
  getPrinterRecordDetail: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getPrinterRecordDetail(this.sn)
      this.setData({
        order: res.printOrder
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})