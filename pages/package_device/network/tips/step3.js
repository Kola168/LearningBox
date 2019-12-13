// pages/network/tips/step3.js
const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
const co = require('../../../../lib/co/co')
const _ = require('../../../../lib/underscore/we-underscore')
const util = require('../../../../utils/util')

const request = util.promisify(wx.request)

import wxNav from '../../../../utils/nav.js'

Page({

  data: {
    isIphone: false,
  },

  onLoad: function(options) {
    if (app.sysInfo.model.indexOf('iPhone') >= 0) {
      this.setData({
        isIphone: true
      })
    }
    this.longToast = new app.weToast()

  },

  loopCheck: co.wrap(function*() {
    this.longToast.toast({
      type: "loading",
    })
    try {
      let that = this
      if (!this.loopCheck.loopTime) {
        this.loopCheck.loopTime = 0
      }
      this.loopCheck.loopTime++
      if (this.loopCheck.loopTime >= 3) {
        this.longToast.toast()
        wx.showToast({
          title: '未搜索到设备',
          icon: 'none'
        })
        this.loopCheck.loopTime = 0
        return
      }
      this.checkequipment()
    } catch (e) {
      console.log(e)
    }
  }),

  checkequipment: co.wrap(function*() {
    let that = this
    try {
      const resp = yield request({
        url: 'http://192.168.178.1:1788/check',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        dataType: 'json'
      })
      console.log(resp)
      if (resp.data.code == 0) {
        this.getEquipmentInfo()
        return
      }
    } catch (e) {
      console.log(e)
      let that = this
      setTimeout(function() {
        that.loopCheck()
      }, 1500)
    }
  }),

  getEquipmentInfo: co.wrap(function*() {
    try {
      const resp = yield request({
        url: 'http://192.168.178.1:1788/info',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {},
        dataType: 'json'
      })
      console.log(resp)
      if (resp.data.code == 0) {
        this.longToast.toast()
        let that = this
        wxNav.navigateTo('/pages/package_device/network/wificonnect/list',{equipInfo:`${encodeURIComponent(JSON.stringify(resp.data.data))}`})
      }
      return
    } catch (e) {
      this.checkequipment()
    }
  }),
})
