// pages/package_subject/sync_learn/learn_detail/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'

import graphql from '../../../../network/graphql/subject'
Page({
  data: {
    currentIndex: 0,
    showMemberToast: false, //显示会员弹窗
    showAiToast: false, // 显示ai出题弹窗
  },

  onLoad: co.wrap(function *(options) {
    this.longToast = new app.weToast()
    this.sn = options.sn
    yield this.getDifficulty()
    yield this.getNodeDetails()
  }),
  
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

  chooseDiff: co.wrap(function*({currentTarget: {dataset: {index}}}){
    try {
      this.setData({
        currentIndex: index
      })
      yield this.getExercises()
    } catch(err) {
    }
  }),

  /**
   * 获取子章节练习详情
   */
  getNodeDetails: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getNodeDetails(this.sn)
      console.log('getNodeDetails==',resp)
      this.setData({
        nodeDetails: resp.xuekewang.node,
      })
      this.longToast.hide()
    }catch(err) {
      this.longToast.hide()
      util.showError(err)
    }
  }),
  
  /**
   * 获取难度系数
   */
  getDifficulty: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getDifficulty()
      this.diffId = resp.xuekewang.diff[this.data.currentIndex].id

      this.setData({
        diffList: resp.xuekewang.diff,
      })
      this.longToast.hide()
    }catch(err) {
      this.longToast.hide()
      util.showError(err)
    }
  }),

  /**
   * 获取练习列表
   */
  getExercises: co.wrap(function*(){
    try {
      var resp = yield graphql.getExercises(+this.diffId, this.sn)
      console.log('===getExercises===', resp)
      this.setData({
        exerciseList: resp.xuekewang.childrenNodes
      })
    }catch(err) {
      util.showError(err)
    }
  }),

  onPullDownRefresh: function () {

  },

  onShareAppMessage: function () {

  }
})