// pages/package_common/record_voice/index/index.js
import {
  wxNav
} from '../../../../utils/common_import'
var app = getApp()
Page({
  data: {
    isFullScreen: false,
  },

  onLoad: function (options) {
    this.setData({
      isFullScreen: app.isFullScreen
    })
  },

  toRecordList: function () {
    wxNav.navigateTo('/pages/package_preschool/record_voice/content/content')
  },

  onReachBottom: function () {

  }
})