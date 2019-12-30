const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'
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
    iosModal: false,
    text: '非会员设备次数已用完，升级会员即可畅享使用'
  },
  onLoad(query) {
    this.longToast = new app.weToast()
    let hideErrorBookTip = Boolean(wx.getStorageSync('hideErrorBookTip'))
    this.setData({
      url: query.url,
      type: query.type,
      hideTip: hideErrorBookTip
    })
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
      type: photo_answer
    })
  },
  getPhotoAnswer: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading'
    })
    let params = {
      openid: app.openId,
      url: this.data.url,
      version: true
    }
    try {
      let resp = yield gql.getPhotoAnswer()
      // let resp = yield api.getPhotoAnswer(params)
      // if (resp.code == 80000) {
      //   wx.hideLoading()
      //   return this.setData({
      //     iosModal: true,
      //   })
      // } else if (resp.code !== 0) {
      //   throw (resp)
      // }
      this.longToast.hide()
      // console.log('resp.res', resp.res)
      // if (resp.res.answer_urls.length > 0) {
      //   this.setData({
      //     hasResult: true,
      //     loadReady: true,
      //     answerUrls: resp.res.answer_urls
      //   })
      //   this.answerUrls = resp.res.answer_urls
      //   this.questionUrl = resp.res.question_url
      // } else {
      //   this.setData({
      //     loadReady: true,
      //     hasResult: false
      //   })
      // }
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
      wx.navigateTo({
        url: `./print?urls=${urls}`
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
    wx.showLoading({
      title: '请稍等',
      mask: true
    })
    try {
      let urls = this.data.answerUrls
      let params = {
        openid: app.openId,
        course: this.course,
        level: this.level,
        reason: this.reason,
        urls: this.questionUrl,
        answer_urls: urls
      }
      // let resp = yield api.updateErrorBook(params, this.mistakeId)
      // if (resp.code !== 0) {
      //   throw (resp)
      // }
      // wx.hideLoading()
      // wx.redirectTo({
      //   url: `../error_book/submit_success?course=${this.course}&type=error_book_search&id=${resp.mistake.id}`
      // })
    } catch (error) {
      wx.hideLoading()
      util.showError(error)
    }
  }),
  handleLeftBtn() {
    let type = this.data.type
    if (type === 'photo_answer') {
      wx.redirectTo({
        url: './camera'
      })
    } else {
      wx.navigateBack()
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