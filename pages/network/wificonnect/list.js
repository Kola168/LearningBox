// pages/network/wificonnect/list.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)

import wxNav from '../../../utils/nav.js'

Page({

  data: {
    wifiList: [
      { SSID: 'asd' }
    ],
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    if (options.equipInfo) {
      this.equipInfo = options.equipInfo
    }
    // this.searchWifi()
  },

  searchWifi: co.wrap(function*() {
    this.longToast.toast({
      type: "loading",
    })
    try {
      const resp = yield request({
        url: 'http://192.168.178.1:1788/wifi_scan',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {},
        dataType: 'json'
      })
      this.longToast.toast()
      if (resp.data.code == 0) {
        this.setData({
          wifiList: resp.data.data
        })
      } else {
        yield showModal({
          title: '提示',
          content: 'wifi列表获取异常',
          showCancel: false,
          confirmColor: '#ff9999'
        })

      }

    } catch (e) {
      yield showModal({
        title: '提示',
        content: '请检查网络',
        showCancel: false,
        confirmColor: '#ff9999'
      })
      this.longToast.toast()
    }
  }),

  connect: co.wrap(function*(e) {
    try {
      let that = this
      wxNav.redirectTo('/pages/network/wificonnect/connect', {
        equipInfo: this.equipInfo,
        wifiSSID: encodeURIComponent(JSON.stringify(that.data.wifiList[e.currentTarget.dataset.index].SSID))
      })
    } catch (e) {
      console.log(e)
    }
  }),

  onShareAppMessage: function() {

  }
})
