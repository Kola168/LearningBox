const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
const co = require('../../../../lib/co/co')
const _ = require('../../../../lib/underscore/we-underscore')
const util = require('../../../../utils/util')
const request = util.promisify(wx.request)
import wxNav from '../../../../utils/nav.js'
import graphql from '../../../../network/graphql/device'


Page({

	onLoad: function (options) {
		this.longToast = new app.weToast()
		if (options.equipInfo) {
			this.equipInfo = options.equipInfo
			
			let equipInfo = JSON.parse(decodeURIComponent(options.equipInfo))
			this.DeviceID = equipInfo.DeviceID
			this.BindCode = equipInfo.BindCode

			this.setData({
				serial: JSON.parse(decodeURIComponent(options.equipInfo)).DeviceID
			})
		}
	},


	setAp: function () {
		wxNav.navigateTo('/pages/package_device/network/wificonnect/list', { equipInfo: this.equipInfo })
	},

	ignoreAp: co.wrap(function* () {
		this.longToast.toast({
			type: "loading",
			title: '请稍候'
		})
		try {
			const resp = yield request({
				url: 'http://192.168.178.1:1788/exit',
				header: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				method: 'POST',
				data: {},
				dataType: 'json'
			})
			if (resp.data.code == 0) {
				this.bindCode()
			}
			return
		} catch (e) {
			this.longToast.toast()
			util.showError(e)
		}
	}),

	//上报code信息
	bindCode: co.wrap(function* () {
		let deviceInfo = {
			serviceSn: this.DeviceID,
			bindCode: this.BindCode,
			serviceType: 'gcp',
		}
		try {
			let res = yield graphql.bindDevice(deviceInfo)
			console.log('上报盒子信息返回的======', res)
			this.longToast.toast()
			return wxNav.switchTab('/pages/index/index')
		} catch (e) {
			console.log('bindCode错误===', e)
			if (e === 'customize-timeout') {  //自定义3秒超时,30次
				if (!that.bindCode.time) {
					that.bindCode.time = 0
				}
				that.bindCode.time++
				if (that.bindCode.time >= 20) {
					this.longToast.toast()
					this.naviagteToStep1('配网超时,请重试')
				} else {
					console.log('that.bindCode.time====', that.bindCode.time)
					that.bindCode()
				}
			} else if (e.errMsg === "request:fail timeout" || e.errMsg === "request:fail") {
				this.longToast.toast()
				this.naviagteToStep1('配网中断，请检查你的网络')
			} else {//其它未知错误
				this.longToast.toast()
				this.naviagteToStep1('未知错误')
			}
		}
	}),

	naviagteToStep1:co.wrap(function* (error) {
		const res = yield showModal({
			title: '提示',
			content: error,
			showCancel: false,
			confirmColor: '#ffdc5e'
		})
		if (res.confirm) {
			return wxNav.navigateTo('/pages/package_device/network/tips/step1')
		}
	})
})