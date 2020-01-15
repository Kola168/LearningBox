// pages/package_preschool/exercise_day/month_compilation_subject/index.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/preschool'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    month: '',
    exerciseContent: [],
    modal: {
      title: '畅享月度合辑',
      desc: '每日一练，每日涨知识',
    }
  },

  onLoad: function (options) {
    this.longtoast = new app.weToast()
    this.sn = options.sn
    options.month && this.setData({
      month: options.month
    })
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
      var resp = yield graphql.getPracticeDayCategory(this.sn)
      this.setData({
        exerciseContent: resp.category.contents
      })
    }catch(err) {
      util.showError(err)
    } finally {
      this.longtoast.hide()
    }
  }),

  /**
   * 跳转每日练习详情
   */
  toExerciseDetail: co.wrap(function*({currentTarget: {dataset: {sn}}}){
      // 判断会员标示
    var memberToast = this.selectComponent('#memberToast')
    memberToast.checkAuthMember(()=>{
      wxNav.navigateTo('../exercises/exercises', {
        sn
      })
    })
   
  }),
  
  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})