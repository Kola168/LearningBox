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
import graphql from '../../../../network/graphql_request'

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
		console.log(this.equipInfo)
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
    this.longToast.toast({
      type: "loading",
      title:'上报打印机信息'
    })
    try {
      let deviceInfo = {
				serviceSn:this.equipInfo.DeviceID,
				bindCode:this.equipInfo.BindCode,
				serviceType:'gcp',
			}
			let res = yield graphql.bindDevice(deviceInfo)
			console.log('res====1======',res)
			let sn = res.bindDevice.device.sn
			console.log('sn====',sn)
      this.checkEquipment(sn)
    } catch (e) {
			console.log('ebindcode======',e)
		return wxNav.navigateTo('/pages/package_device/network/tips/step1')
		}  
  }),
	
	checkEquipment: co.wrap(function*(sn) {
    try {
      this.longToast.toast({
        title: '检查打印机状态',
        type: 'loading'
      })
			let res = yield graphql.getDeviceDetail(sn)
			console.log('res==========',res)
      console.log('获取打印机详细信息', res)
      // if (resp.data.code != 0) {
      //   this.longToast.toast()
      //   throw (resp.data)
      // } else {
      //   if (resp.data.printer.active == 'online') {
      //     wx.showToast({
      //       title: '绑定成功',
      //       duration: 5000,
      //     })
      //   } else if (resp.data.printer.active == 'offline') {
      //     throw ('设备offline')
      //   }
      // }
    } catch (e) {
			console.log('echeckEquipment======',e)
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
