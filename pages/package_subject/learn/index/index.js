// pages/package_subject/learn/index/index.js


"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
const request = util.promisify(wx.request)
const event = require('../../../../lib/event/event')
import graphql from '../../../../network/graphql_request'
import storage from '../../../../utils/storage'
import router from '../../../../utils/nav'
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_subject/learn/index/index')
Page({

  data: {
    searchObj: {
      isSearch: true,
      url: 'xxxxx',
      placeText: '请输入想要搜索的内容',
    }
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
  },

  onShow: function () {

  },

  toMore: co.wrap(function*(){
    console.log('查看更多')
  }),

  onHide: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})