// pages/package_preschool/exercise_day/answer/index.js
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
    practiceContentToday: null,
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
      this.printSn = resp.feature.practiceContentToday && resp.feature.practiceContentToday.sn
      this.setData({
        practiceContentToday: resp.feature.practiceContentToday,
        practiceAnswerImages: resp.feature.practiceContentToday && resp.feature.practiceContentToday.practiceAnswerImages
      })
    }catch(err) {
      util.showError(err)
    }finally {
      this.longtoast.hide()
    }
  }),

  toPrint: co.wrap(function *() {
    try {
      wxNav.navigateTo('/pages/package_common/setting/setting', {
        settingData: encodeURIComponent(JSON.stringify({
          file: {
            name: this.data.practiceContentToday.name
          },
          orderPms: {
            printType: 'RESOURCE',
            pageCount: this.data.practiceAnswerImages.length,
            featureKey: 'daily_practice',
            resourceOrderType: 'DailyPractice',
            resourceAttribute: {
              sn: this.printSn,
              resourceType: 'Content',
              answer: true,
            }
          },
          checkCapabilitys: {
            isSettingColor: true,
          }
       }))
      })
    } catch(err) {
      util.showError(err)
    }
  }),

  onShareAppMessage: function () {

  }
})