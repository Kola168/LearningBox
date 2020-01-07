// pages/package_preschool/exercise_day/exercises/exercises.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/preschool'
Page({
  data: {
    isUse: false,
    practiceQuestionImages: []
  },

  onLoad: co.wrap(function * (options) {
    this.longtoast = new app.weToast()
    this.sn = options.sn || ''
    var isUse = storage.get('isUse')
    this.setData({
      isUse:!!isUse
    })

    if (isUse) {
      if (this.sn) {
        yield this.getMonthExercises()
      } else {
        yield this.getPracticeContentToday()
      }
    }
  }),

  /**
   * 获取指定日期的每日一练题目
   */
  getMonthExercises: co.wrap(function *() {
    this.longtoast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getMonthExercises(this.sn)
      this.printSn = resp.content.sn
      this.setData({
        practiceQuestionImages: resp.content.practiceQuestionImages,
        
      })
    }catch(err) {
      util.showError(err)
    } finally {
      this.longtoast.hide()
    }
  }),

  /**
   * 获取每日一练题目
   */
  getPracticeContentToday: co.wrap(function *() {
     this.longtoast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getPracticeContentToday()
      this.printSn = resp.feature.practiceContentToday.sn
      this.setData({
        practiceQuestionImages: resp.feature.practiceContentToday && resp.feature.practiceContentToday.practiceQuestionImages
      })
    }catch(err) {
      util.showError(err)
    } finally {
      this.longtoast.hide()
    }
  }),

  toStudy: co.wrap(function *() {
    storage.put('isUse', true)
    this.setData({
      isUse: true
    })
    yield this.getPracticeContentToday()
  }),

  /**
   * 去打印
   */
  toPrint: co.wrap(function*(){
    try {
      wxNav.navigateTo('/pages/package_common/setting/setting', {
        settingData: encodeURIComponent(JSON.stringify({
          file: {
            name: '测试的名字'
          },
          orderPms: {
            printType: 'RESOURCE',
            pageCount: this.data.practiceQuestionImages.length,
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

  /**
   * 跳转每日一练答案
   */
  tobabyAnswer: co.wrap(function *() {
    wxNav.navigateTo('../answer/index')
  }),

  /**
   * 跳转月度合辑
   */
  toMonthCompilation: co.wrap(function *() {
    wxNav.navigateTo('../month_compilation/index')
  }),

  /**
   * 跳转宝宝奖状
   */
  toBabyCertificate: co.wrap(function *() {
    wxNav.navigateTo('../certificate/index')
  }),
})