"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../utils/common_import'
import subjectGql from '../../../network/graphql/subject'
const event = require('../../../lib/event/event')

Page({
  data: {
    loadReady: true,
    subjectVideoUrl: null
  },

  onLoad(query) {
    if (query.scene) {
      let scene = decodeURIComponent(query.scene)
      this.answerId = scene.split('_')[1]
      this.answerType = scene.split('_')[2] === 'report' ? 'XuekewangReport' : 'XuekewangExercise'
    }
    this.weToast = new app.weToast()
    event.on('Authorize', this, () => {
      this.getAnswerInfo()
    })
    let isAuth = app.isScope()
    if (!isAuth) {
      return wxNav.navigateTo("/pages/authorize/index")
    }
    this.getAnswerInfo()
  },

  getAnswerInfo: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield subjectGql.getSubjectAnswer(this.answerId, this.answerType)
      this.weToast.hide()
      this.answerPdf = resp.xuekewang.previewAnswer
      this.openDocument()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  openDocument() {
    wx.downloadFile({
      url: this.answerPdf,
      success(res) {
        wx.openDocument({
          filePath: res.tempFilePath
        })
      }
    })
  },

  backIndex() {
    wxNav.switchTab('/pages/index/index')
  }
})