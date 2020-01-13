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
const logger = new Logger.getLogger('pages/package_preschool/record_voice/content/content')
Page({
  data: {
    tabId: 0,
    showMore: false,
    categories: [],
    showCatesModal: false,
    isAndroid: false,
    isMember: false,
    top: 0,
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    let systemInfo = wx.getSystemInfoSync()
    this.setData({
      isAndroid: systemInfo.system.indexOf('iOS') > -1 ? false : true,
      top: app.navBarInfo.topBarHeight,
    })
    if (app.isScope()) {
      yield this.getCategory()
    }
  }),
 
  /**
   * 打开分类弹窗
   */
  openCategory: function () {
    this.setData({
      showCatesModal: true
    })
  },

  /**
   * 关闭分类弹窗
   * @param {*} e 
   */
  closeCategory: function (e) {
    this.setData({
      showCatesModal: false
    })
  },

  /**
   * 获取分类信息
   */
  getCategory: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      var resp = yield graphql.getRecordCategories('kid_record')
      this.setData({
        categories: [{name: '全部',sn: 'all'}].concat(resp.feature.categories),
        contents: resp.feature.contents
      })
      this.longToast.hide()
    } catch(err) {
      util.showError(err)
      this.longToast.hide()
      logger.info(err)
    }
  }),

  getRecordList: co.wrap(function*(sn){
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      var resp = yield graphql.getRecordList(sn)
      this.setData({
        contents: resp.category.contents
      })
      this.longToast.hide()
    }catch(err) {
      util.showError(err)
      this.longToast.hide()
      logger.info(err)
    }
  }),

  back: function () {
    return
  },

  changeTab: co.wrap(function* (e) {
    var id = e.currentTarget.id
    var sn = e.currentTarget.dataset.sn
    id = id.slice(1, id.length)

    if (id == this.data.tabId) {
      return
    }
    this.setData({
      contents: [],
      tabId: id
    })
    this.setData({
      showCatesModal: false
    })
    if (id == 0) {
      return this.getCategory()
    }
    this.getRecordList(sn)
  }),

  onReachBottom: function () {
    console.log('分页加载')
  },

  /**
   * @methods 跳转内容详情
   */
  playPreview: co.wrap(function* ({currentTarget: {dataset: {item}}}) {
    router.navigateTo('/pages/package_preschool/record_voice/content_detail/content_detail', {
      title: item.name,
      sn: item.sn,
    })

  })

})