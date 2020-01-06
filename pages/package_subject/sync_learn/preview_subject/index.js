// pages/package_subject/sync_learn/preview_subject/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
import busFactory from '../busFactory'
import graphql from '../../../../network/graphql/subject'
Page({

  data: {
    isPrintAnswer: true,
    currentIndex: 1,
    exercise: null,
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.sn = options.sn
    this.getExercisesDetail()
  },

  changeImg: function ({
    detail: {
      current
    }
  }) {
    this.setData({
      currentIndex: current + 1
    })
  },

  /**
   * 获取练习详情
   */
  getExercisesDetail: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      tite: '请稍后...'
    })
    try {
      var resp = yield graphql.getExercisesDetail(this.sn)
      this.setData({
        exercise: resp.xuekewang.exercise
      })
      this.longToast.hide()
    } catch (err) {
      this.longToast.hide()
      util.showError(err)
    }
  }),

  /**
   * @methods 确认
   */
  confirm: co.wrap(function* (e) {
    var memberToast = this.selectComponent('#memberToast')
    // memberToast.showToast()
    // 开通会员
    this.print()
  }),

  checkAnswer: function () {
    this.setData({
      isPrintAnswer: !this.data.isPrintAnswer
    })
  },

  print: co.wrap(function* () {
    try {


      var postData = {
        name: this.data.exercise.exerciseName,
        isPrintAnswer: this.data.isPrintAnswer,
        pageCount: this.data.isPrintAnswer ? this.data.exercise.answerImages.length : this.data.exercise.images.length,
        sn: this.sn,
        featureKey: 'xuekewang_exercise',
      }
      wxNav.navigateTo('/pages/package_subject/setting/setting', {
        postData: encodeURIComponent(JSON.stringify(postData)),
      })
    } catch (err) {
      util.showError(err)
    }

  }),

  onHide() {}
})