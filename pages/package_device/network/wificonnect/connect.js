// pages/network/wificonnect/connect.js
const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
const co = require('../../../../lib/co/co')
const _ = require('../../../../lib/underscore/we-underscore')
const util = require('../../../../utils/util')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const getNetworkType = util.promisify(wx.getNetworkType)

import wxNav from '../../../../utils/nav.js'
Page({

  data: {
    wifiSSID: '',
    passWord: '',
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    console.log(options)
    this.equipInfo = JSON.parse(decodeURIComponent(options.equipInfo))
    this.wifiSSID = JSON.parse(decodeURIComponent(options.wifiSSID))
    this.setData({
      wifiSSID: this.wifiSSID
    })
  },

  inputprintNum: function(e) {
    console.log(e)
    this.setData({
      passWord: e.detail.value
    })
  },

  confPsd: co.wrap(function*() {
    this.longToast.toast({
      type: "loading",
    })
    try {
      const resp = yield request({
        url: 'http://192.168.178.1:1788/wifi_set',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          ssid: this.data.wifiSSID,
          psk: this.data.passWord
        },
        dataType: 'json'
      })
      console.log(resp)
      this.longToast.toast()
      if (resp.data.code == 0) {
        this.checkNet()
      } else {
        yield showModal({
          title: '提示',
          content: '配网失败',
          showCancel: false,
          confirmColor: '#ff9999'
        })
      }
    } catch (e) {
      this.longToast.toast()
      yield showModal({
        title: '提示',
        content: '网络异常',
        showCancel: false,
        confirmColor: '#ff9999'
      })
    }
  }),
  checkNet: co.wrap(function*() {
    this.longToast.toast({
      type: "loading",
    })
    try {
      let netWorkType = yield getNetworkType()
      if (netWorkType.networkType != 'none') {
        this.bindCode()
      } else {
        throw ('err')
      }
    } catch (e) {
      console.log(e)
      let that = this
      if (!that.checkNet.time) {
        that.checkNet.time = 0
      }
      that.checkNet.time++
      if (that.checkNet.time >= 10) {
        this.longToast.toast()
        wx.showModal({
          title: '提示',
          content: '请检查网络',
        })
        this.setData({
          netcomplete: false
        })
        return
      }
      setTimeout(function() {
        that.checkNet()
      }, 1500)
    }
  }),
  bindCode: co.wrap(function*() {
    // this.longToast.toast({
    //   type: "loading",
    //   title:'上报打印机信息'
    // })
    // try {
    //   let unionId = wx.getStorageSync('unionId')
    //   const resp = yield request({
    //     url: app.apiServer + `/boxapi/v2/device/bind`,
    //     method: 'POST',
    //     dataType: 'json',
    //     data: {
    //       unionid: unionId,
    //       bind_code: this.equipInfo.BindCode,
    //       mac_address: this.equipInfo.DeviceID,
    //       model: 'EP400'
    //     }
    //   })
    //   this.checkEquipment()
    //
    // } catch (e) {

    //   if (that.bindCode.time >= 10) {
    //     this.longToast.toast()
    //     wx.showModal({
    //       title: '提示',
    //       content: '请检查网络',
    //     })

    // }
  }),
  checkEquipment: co.wrap(function*() {
    try {
      this.longToast.toast({
        title: '监测打印机状态',
        type: 'loading'
      })
      const resp = yield request({
        url: app.apiServer + `/ec/v2/printers/${this.equipInfo.DeviceID}`,
        method: 'GET',
        dataType: 'json',
        data: {
          openid: app.openId,
          printer_type: 'EpDevice'
        }
      })
      console.log('获取打印机详细信息', resp)
      if (resp.data.code != 0) {
        this.longToast.toast()
        throw (resp.data)
      } else {
        if (resp.data.printer.active == 'online') {
          wx.showToast({
            title: '绑定成功',
            duration: 5000,
          })
        } else if (resp.data.printer.active == 'offline') {
          throw ('设备offline')
        }
      }
    } catch (e) {
      console.log(e)
      let that = this
      if (!that.checkEquipment.time) {
        that.checkEquipment.time = 0
      }
      that.checkEquipment.time++
      if (that.checkEquipment.time >= 10) {
        this.longToast.toast()
        yield showModal({
          title: '提示',
          content: '绑定失败',
          showCancel: false,
          confirmColor: '#ff9999'
        })
        this.setData({
          netcomplete: false
        })
        wxNav.navigateTo('/pages/package_device/network/tips/step1')
        return
      }
      setTimeout(function() {
        that.checkEquipment()
      }, 3000)
    }
  }),
})
