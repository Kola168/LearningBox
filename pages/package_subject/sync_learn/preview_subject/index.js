// pages/package_subject/sync_learn/preview_subject/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/subject'
Page({

  data: {
    isPrintAnswer: false,
    currentIndex: 1,
    exercise: null,
    memberToast: "syncLearn",
  },

  onLoad: co.wrap(function *(options) {
    this.longToast = new app.weToast()
    this.sn = options.sn
    this.isAiExercise = options.isAi || false
    this.mediaType = options.mediaType
    yield this.getMember()
    yield this.getExercisesDetail()
  }),

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
   * 判断是否是会员
   */
  getMember: co.wrap(function*(){
    try {
      var resp = yield graphql.getSubjectMemberInfo()
      this.setData({
        isSchoolAgeMember: resp.currentUser.isSchoolAgeMember
      })
    } catch(err) {
      util.showError(err)
    }
  }),

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
    if (!this.data.isSchoolAgeMember && !this.data.exercise.isPrint && !this.isAiExercise) {
      var member = this.selectComponent('#memberToast')
      return member.showToast()
    }
    // 开通会员
    this.print()
  }),

  checkAnswer: function () {
    this.setData({
      isPrintAnswer: !this.data.isPrintAnswer,
      currentIndex: 1
    })
  },

  print: co.wrap(function* () {
    try {

      wxNav.navigateTo('/pages/package_common/setting/setting', {
        settingData: encodeURIComponent(JSON.stringify({
          file: {
            name: this.data.exercise.exerciseName,
          },
          orderPms: {
            printType: 'PRINTSUBJECT',
            pageCount: this.data.isPrintAnswer ? this.data.exercise.answerImages.length : this.data.exercise.images.length,
            featureKey: 'xuekewang_exercise',
            mediaType: this.mediaType,
            attributes: {
              resourceType: 'XuekewangExercise',
              sn: this.sn,
              originalUrl: this.data.isPrintAnswer ? this.data.exercise.answerPdf.nameUrl : this.data.exercise.pdf.nameUrl,
            }
          },
          checkCapabilitys: {
            isSettingDuplex: true,
            isSettingColor: true,
            isSettingOddEven: true, //是否设置奇偶
            // isSettingSkipGs: true, //是否支持文件修复
            isSinglePageLayout: true //是否支持缩放
          }
       }))
      })
    } catch (err) {
      util.showError(err)
    }

  }),

  onHide() {}
})