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

  checkequipment: co.wrap(function*() {
		  let that = this
		  this.longToast.toast({
      type: "loading",
		})
		var timer,resp = undefined
		timer = setTimeout(() => {
			resp.abort()
			wx.showToast({
				title: '设备未绑定,请按照提示连接设备',
				icon: 'none',
				duration: 3000
			})
		}, 3000)

		try {
        resp = wx.request({
        url: 'http://192.168.178.1:1788/check',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
				dataType: 'json',
				success(resp){
					if (resp.data.code == 0) {
						that.getEquipmentInfo()
					}
				},complete(){
					that.longToast.toast()
					timer && clearTimeout(timer)
				}
      })
    } catch (e) {
			this.longToast.toast()
			util.showError(e)
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
				return	wxNav.navigateTo('/pages/package_device/network/tips/step4',{equipInfo:`${encodeURIComponent(JSON.stringify(resp.data.data))}`})
      } 
    } catch (e) {
			this.longToast.toast()
      this.checkequipment()
    }
  }),
})
