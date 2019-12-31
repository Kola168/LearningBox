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
import commonRequest from '../../../../utils/common_request'
import graphql from '../../../../network/graphql/subject'
Page({

  data: {
    isPrintAnswer: true,
    currentIndex: 1,
    imgList: [
      'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png',
      'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    ],
    confirmModal: {
			isShow: false,
			title: '请正确放置A4打印纸',
			image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
		}
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.sn = options.sn
    this.getExercisesDetail()
  },

  changeImg: function({detail: {current}}) {
    this.setData({
      currentIndex: current + 1
    })
    console.log(current,'current')
  },

  /**
   * 获取练习详情
   */
  getExercisesDetail: co.wrap(function*(){
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
    } catch(err) {
      this.longToast.hide()
      util.showError(err)
    }
  }),

  	/**
	 * @methods 确认
	 */
	confirm: co.wrap(function*(e) {

    let hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
    console.log(hideConfirmPrintBox, '==hideConfirmPrintBox==')
    
    if (hideConfirmPrintBox) {
      this.print()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  }),
  
  checkAnswer: function(){
    this.setData({
      isPrintAnswer: !this.data.isPrintAnswer
    })
  },

  print: co.wrap(function*(){
    try {
      var printCapability = yield commonRequest.getPrinterCapacity('xuekewang_exercise')
      if (!printCapability) {
        return
      }

      console.log(printCapability,'==printCapability==')
      var postData = {
        name: this.data.exercise.exerciseName,
        color: printCapability.color,
        grayscale: printCapability.grayscale,
        duplex: printCapability.duplex,
        colorCheck: printCapability.color ? true : false,
        duplexCheck: printCapability.duplex,
        isPrintAnswer: this.data.isPrintAnswer,
        pageCount: this.data.isPrintAnswer ? this.data.exercise.answerImages.length : this.data.exercise.images.length,
        skipGs: true,
        sn: this.sn,
      }
      console.log(postData,'==postData')
      wxNav.navigateTo('/pages/package_subject/sync_learn/setting/setting',
      {
        postData: encodeURIComponent(JSON.stringify(postData)),
      })
    } catch(err) {
      util.showError(err)
    }

  }),

  onHide () {
    busFactory.removeDestoryData()
  },

  onShareAppMessage: function () {

  }
})