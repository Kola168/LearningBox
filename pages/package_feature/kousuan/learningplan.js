// pages/package_feature/kousuan/learningplan.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql/feature'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    planTypeCheck: 'processing',
    stateList: [],
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
  },

  onShow: function(options) {
    this.getTimeList()
  },

  getTimeList: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield graphql.timedTasks({
        state: this.data.planTypeCheck,
        taskType: 'kousuan'
      })
      Loger(resp)
      this.setData({
        stateList: resp.timedTasks
      })
      this.longToast.toast()
    } catch (e) {
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }
  }),

  setPlanTime: function(e) {
    let index = e.currentTarget.dataset.index
    wxNav.navigateTo('/pages/package_feature/kousuan/createTime', {
      sn: this.data.stateList[index].sn
    })
  },

  stopPlan: co.wrap(function*(e) {
    let index = e.currentTarget.dataset.index

    this.longToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield graphql.updateTimedtask({
        sn: this.data.stateList[index].sn,
      })
      Loger(resp)
      wx.showToast({
        title: '已提前结束',
        duration: 2000,
        icon: 'none',
        mask: true
      })
      this.longToast.toast()
    } catch (e) {
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }
    this.getTimeList()
  }),

  checkPlanType: function(e) {
    let type = e.currentTarget.dataset.type
    this.setData({
      planTypeCheck: type
    })
    this.getTimeList()
  },

  createPlan: function() {
    wxNav.navigateTo('/pages/package_feature/kousuan/createplan')
  },

})
