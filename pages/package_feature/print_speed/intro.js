// pages/error_book/pages/print_speed/intro.js
const event = require('../../../lib/event/event')
const app = getApp()

Page({
    data: {
      butHigh:false
    },
    onLoad: function(options) {
      this.setStorage()
      if (app.isFullScreen) {
        this.setData({
          butHigh: true
        })
      } else if (app.isFullScreen == undefined) {
        let that = this
        setTimeout(function() {
          that.setData({
            butHigh: app.isFullScreen
          })
        }, 500)
      }
    },

  setStorage: function () {
    wx.setStorageSync('suyin', 'suyin')
  },


    onShow: function() {
        let unionId = wx.getStorageSync('unionId')

        if (!unionId) {
            let url = '/pages/authorize/index'
            wx.navigateTo({
                url: url,
            })
        }
    },


    toIndex: function() {
        wx.navigateTo({
            url: 'index',
        })
    }

})