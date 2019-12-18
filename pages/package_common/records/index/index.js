"use strict"
const app = getApp()
import { regeneratorRuntime, co, wxNav, util } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'

Page({
  data: {
    orders: [],
    isOwner: false,
    //黑色浮层提示
    showInterceptModal: '',
    activeDevice: null,
    devices: [],
    changeType: false,
    activeType: 'all',
    showDeleteRecordModal: false,
    recordModalType: 'delete',
    deleteRecordSn: null,
    showRemind: false, //是否显示展示数据提示
    hasEcPrinter: false
  },
  onLoad: co.wrap(function*(options) {
    this.weToast = new app.weToast()
    setTimeout(()=>{
      // let navBarHeight = app.navBar
    },300)
  }),

  onShow: co.wrap(function*() {

  })
})