// pages/error_book/pages/print_speed/intro.js
const event = require('../../../lib/event/event')

Page({
    data: {

    },
    onLoad: function(options) {
      this.setStorage()
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