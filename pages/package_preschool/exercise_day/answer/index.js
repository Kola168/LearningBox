// pages/package_preschool/exercise_day/answer/index.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/preschool'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    practiceAnswerImages: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.longtoast = new app.weToast()
    this.getPracticeContentToday()
  },
  onShow: function () {

  },

  /**
   * 获取每日一练答案
   */
  getPracticeContentToday: co.wrap(function *() {
    this.longtoast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getPracticeContentToday()
      this.setData({
        practiceAnswerImages: resp.feature.practiceContentToday && resp.feature.practiceContentToday.practiceAnswerImages
      })
    }catch(err) {
      util.showError(err)
    }finally {
      this.longtoast.hide()
    }
  }),

  toPrint: co.wrap(function *() {
    console.log('去打印')
  }),

  onShareAppMessage: function () {

  }
})