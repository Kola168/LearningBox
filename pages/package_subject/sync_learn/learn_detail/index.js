// pages/package_subject/sync_learn/learn_detail/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'

import graphql from '../../../../network/graphql_request'
Page({
  data: {
    showMemberToast: false, //显示会员弹窗
    showAiToast: false, // 显示ai出题弹窗
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
  },

  
  /**
   * 打开弹窗
   */
  openAiToast: function() {
    var memberToast =  this.selectComponent('#memberToast')
    memberToast.showToast()
  },

  /**
   * 智能出题
   */
  setTopic: co.wrap(function*(){
    console.log('出一道题')
    this.cancelSet()
  }),

  /**
   * 取消ai出题
   */
  cancelSet: function() {
    this.setData({
      showAiToast: false
    })
  },
  onHide: function () {

  },

  onPullDownRefresh: function () {

  },

  onShareAppMessage: function () {

  }
})