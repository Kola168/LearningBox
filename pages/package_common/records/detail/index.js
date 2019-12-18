"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'
Page({
  data: {

  },
  onLoad: function (query) {
    this.sn = query.sn
    this.getPrinterRecordDetail()
  },
  getPrinterRecordDetail:co.wrap(function*(){
    try {
      let res = yield graphql.getPrinterRecordDetail(this.sn)
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})