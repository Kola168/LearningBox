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
      this.answerType = scene.split('_')[2]
    }
    this.weToast = new app.weToast()
    event.on('Authorize', this, () => {
      this.setData({
        isAuth: app.isScope()
      })
      this.getAnswerInfo()
    })
    let isAuth = app.isScope()
    if (!isAuth) {
      return wxNav.navigateTo("/pages/authorize/index")
    }
    this.getAnswerInfo()    
  },

  getAnswerInfo: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍等'
    })
    try {
      let resp = yield subjectGql.getSubjectAnswerInfo(this.answerId,this.answerType)
      this.weToast.hide()
      wx.downloadFile({
        // url: 'https://cdn-h.gongfudou.com/Leviathan/backend/attachment/attachment/dd4adfefe3614e54a43401d2fa91f7be.pdf',
        url: resp.res,
        success(res) {
          wx.openDocument({
            filePath: res.tempFilePath
          })
        }
      })
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  backIndex() {
    wxNav.switchTab('/pages/index/index')
  }
})