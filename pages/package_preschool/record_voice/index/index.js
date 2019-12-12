// pages/package_common/record_voice/index/index.js
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

  onReachBottom: function () {

  }
})