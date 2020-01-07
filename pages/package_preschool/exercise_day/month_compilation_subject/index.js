// pages/package_preschool/exercise_day/month_compilation_subject/index.js
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

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.longtoast = new app.weToast()
    this.sn = options.sn
    this.getMonthExercises()

  },

  /**
   * 获取月度练习列表
   */
  getMonthExercises: co.wrap(function*(){
    this.longtoast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getMonthExercises(this.sn)
      console.log(resp, '===resp===')
    }catch(err) {
      util.showError(err)
    } finally {
      this.longtoast.hide()
    }
  }),
  
  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})