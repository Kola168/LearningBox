const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import router from '../../../utils/nav'
import featureGql from '../../../network/graphql/feature'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

Page({
  data: {
    url: '',
    type: '',
    answerUrls: [],
    hasResult: true,
    loadReady: false,
    hideTip: true,
    butHigh:false
  },
  onLoad(query) {
    this.longToast = new app.weToast()
    let hideErrorBookTip = Boolean(wx.getStorageSync('hideErrorBookTip'))
    this.setData({
      url: query.url,
      type: query.type, //photo_answer拍搜,error_book_search已保存错题搜索 before_add_error_book保存错题钱搜索
      hideTip: hideErrorBookTip
    })
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    } else if (app.isFullScreen == undefined) {
      let that = this
      setTimeout(function () {
        that.setData({
          butHigh: app.isFullScreen
        })
      }, 500)
    }
    if (query.type === 'error_book_search') {
      this.mistakeId = query.id
      this.course = query.course
      this.level = query.level
      this.reason = query.reason
    }
    this.getPhotoAnswer()
  },
  addErrorBook() {
    let url = this.questionUrl,
      answerUrls = JSON.stringify(this.answerUrls)
    router.redirectTo('/pages/package_feature/error_book/topic_details', {
      url: url,
      answer_urls: answerUrls,
      type: 'photo_answer'
    })
  },
  getPhotoAnswer: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading'
    })
    let params = {
      url: this.data.url,
    }
    try {
      let resp = yield featureGql.getPhotoAnswer(params)
      console.log(resp)

      this.longToast.hide()
      // console.log('resp.res', resp.res)
      let mistakeSearch = resp.mistakeSearch
      if (mistakeSearch.answerUrls.length > 0) {
        this.setData({
          hasResult: true,
          loadReady: true,
          answerUrls: mistakeSearch.answerUrls
        })
        this.answerUrls = mistakeSearch.answerUrls
        this.questionUrl = mistakeSearch.questionUrl
      } else {
        this.setData({
          loadReady: true,
          hasResult: false
        })
      }
    } catch (error) {
      this.setData({
        loadReady: true,
        hasResult: false
      })
      this.longToast.hide()
      util.showError(error)
    }
  }),
  handleRightBtn() {
    let urls = JSON.stringify(this.data.answerUrls)
    let type = this.data.type
    if (type === 'photo_answer') {
      router.navigateTo('/pages/package_feature/error_book/answer_print',{
       urls:urls
      })
    } else if (type === 'error_book_search') {
      this.updateErrorBook()
    } else if (type === 'before_add_error_book') {
      let pages = getCurrentPages(),
        prePage = pages[pages.length - 2]
      prePage.setData({
        answer_urls: this.data.answerUrls,
        urls: [this.questionUrl]
      })
      wx.navigateBack()
    }
  },
  updateErrorBook: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading'
  })
    try {
      let urls = this.data.answerUrls
      let params = {
        urls: this.questionUrl,
        course: this.course,
        level: this.level,
        reason: this.reason,
        answerUrls: urls,
        id:Number(this.mistakeId)
      }
      const resp = yield featureGql.saveMistakes(params)
      this.longToast.hide()
      router.redirectTo('/pages/package_feature/error_book/submit_success',{
        type:'error_book_search',
        id:resp.createMistake.mistake
      })
    } catch (error) {
      wx.hideLoading()
      util.showError(error)
    }
  }),
  handleLeftBtn() {
    let type = this.data.type
    if (type === 'photo_answer') {
      router.redirectTo('/pages/package_feature/error_book/camera', {
        type
      })
    } else {
      router.navigateBack()
    }
  },
  closeTip() {
    this.setData({
      hideTip: true
    })
    wx.setStorageSync('hideErrorBookTip', true)
  },
  back: function () {
    wx.navigateBack()
  }
})