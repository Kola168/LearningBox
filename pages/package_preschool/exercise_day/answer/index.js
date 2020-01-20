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
    practiceAnswerImages: [],
    imgW: 0,
    imgH: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.longtoast = new app.weToast()
    this.initImgSize()
    this.getPracticeContentToday()
  },
  onShow: function () {

  },

  initImgSize: function(){
    var system = wx.getSystemInfoSync()
    var screenHeight = system.screenHeight
    var screenWidth = system.screenWidth
    var maxHeight = screenHeight * 0.65
    var margin = 23 * 2
    var a4Ratio = 210 / 297 
    var imgW = (screenWidth - margin)
    var imgH = imgW / a4Ratio 
    if (imgH > maxHeight) {
      imgH = maxHeight
      imgW = imgH * a4Ratio
    }

    this.setData({
      imgW,
      imgH
    })
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
      if (resp.dailyPractice.practiceContentToday) {
        this.printSn = resp.dailyPractice.practiceContentToday && resp.dailyPractice.practiceContentToday.sn
        this.setData({
          practiceContentToday: resp.dailyPractice.practiceContentToday,
          practiceAnswerImages: resp.dailyPractice.practiceContentToday && resp.dailyPractice.practiceContentToday.practiceAnswerImages
        })
      }
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
            mediaType: 'daily_practice',
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