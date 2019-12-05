// pages/print_wx/subscribe.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const request = util.promisify(wx.request)

Page({
  data: {
    type: null,
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.user_id = options.user_id
    this.setData({
      type: JSON.parse(options.publicType)
    })
  },

  toCancel: co.wrap(function* (e) {
    var arr = []
    for (let i in this.data.type) {
      arr.push(this.data.type[i])
    }
    let parentIndex = e.currentTarget.dataset.type
    let index = e.currentTarget.id
    let content = this.data.type[parentIndex].content[index]
    var con = []
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].content.length; j++) {
        if (arr[i].content[j].is_subscription == 1) {
          con.push(arr[i].content[j])
        }
      }
    }
    if (con.length >= 2) {
      content.is_subscription = 0
      this.setData({
        type: this.data.type
      })
    } else {
      return util.showError({
        message: '这是最后一个公众号，暂时无法取消'
      })
    }
    var params = {
      user_id: this.user_id,
      public_info_id: content.public_info_id,
      status: 0
    }
    this.longToast.toast({
      type: 'loading',
      title: '请稍候',
    })
    try {
      var resp = yield request({
        url: `https://ta.dc.gongfudou.com/api/wx_article/publicSubscription`,
        method: 'POST',
        dataType: 'json',
        data: params
      })
      if (resp.data.code !== 0) {
        throw (resp.data)
      }
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),

  toSub: co.wrap(function* (e) {
    var parentIndex = e.currentTarget.dataset.type
    var index = e.currentTarget.id
    var content = this.data.type[parentIndex].content[index]
    content.is_subscription = 1
    this.setData({
      type: this.data.type
    })
    var params = {
      user_id: this.user_id,
      public_info_id: content.public_info_id,
      status: '1'
    }
    this.longToast.toast({
      type: 'loading',
      title: '请稍候',
      duration: 0
    })
    try {
      var resp = yield request({
        url: `https://ta.dc.gongfudou.com/api/wx_article/publicSubscription`,
        method: 'POST',
        dataType: 'json',
        data: params
      })
      if (resp.data.code !== 0) {
        throw (resp.data)
      }
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),
})