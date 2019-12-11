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

	onLoad: function (options) {
		this.longToast = new app.weToast()
		console.log(options)
		this.equipInfo = JSON.parse(decodeURIComponent(options.equipInfo))
		this.wifiSSID = JSON.parse(decodeURIComponent(options.wifiSSID))
		this.setData({
			wifiSSID: this.wifiSSID
		})
		console.log(this.equipInfo)
	},

	inputprintNum: function (e) {
		console.log(e)
		this.setData({
			passWord: e.detail.value
		})
	},

	confPsd: co.wrap(function* () {
		this.longToast.toast({
			type: "loading",
			title: '正在配网'
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
			console.log('设置密码=====', resp)
			if (resp.data.code == 0) {
				this.checkNet()  //设置成功后检查网络的物理状态
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

	//检查物理网络状态
	checkNet: co.wrap(function* () {
		let that = this
		try {
			let netWorkType = yield getNetworkType()
			if (netWorkType.networkType != 'none') {  //物理状态不一定有网
				console.log('netWorkType.networkType====', netWorkType.networkType)
				setTimeout(function () {
					that.bindCode()
				}, 3000)
			} else {
				if (!that.checkNet.time) {
					that.checkNet.time = 0
				}
				that.checkNet.time++
				if (that.checkNet.time >= 10) {
					this.longToast.toast()
					wx.showModal({
						title: '提示',
						content: '请检查网络状态',
					})
					return
				}
				setTimeout(function () {
					that.checkNet()
				}, 1500)
			}
		} catch (e) {
			return wxNav.navigateTo('/pages/package_device/network/tips/step1')
		}
	}),

	//上报code信息
	bindCode: co.wrap(function* () {
		try {
			let deviceInfo = {
				serviceSn: this.equipInfo.DeviceID,
				bindCode: this.equipInfo.BindCode,
				serviceType: 'gcp',
			}
			console.log('deviceInfo=====', deviceInfo)
			let res = yield graphql.bindDevice(deviceInfo)
			console.log('res====1======', res)
			let sn = res.bindDevice.device.sn
			this.checkEquipment(sn)
		} catch (e) {
			console.log('e==bindCode===',e)
			//如果是没有网络或者超时的情况下重试一次
			if(e.errMsg ==="request:fail timeout" || e.errMsg ==="request:fail"){
				if (!that.bindCode.time) {
					that.bindCode.time = 0
				}
				that.bindCode.time++
				if (that.bindCode.time >= 2) {
					this.longToast.toast()
					wx.showModal({
						title: '提示',
						content: '请检查网络状态',
					})
					this.longToast.toast()
					return wxNav.navigateTo('/pages/package_device/network/tips/step1')
				}
			}else{
				this.longToast.toast()
				return wxNav.navigateTo('/pages/package_device/network/tips/step1')
			}
		}
	}),

	//轮询获取盒子在线状态
	checkEquipment: co.wrap(function* (sn) {
		try {
			let res = yield graphql.getDeviceDetail(sn)
			console.log('获取打印机详细信息', res)
			console.log('获取打印机状态', res.device.onlineState)

			if (res.device.onlineState != 'online') {
				let that = this
				if (!that.checkEquipment.time) {
					that.checkEquipment.time = 0
				}
				that.checkEquipment.time++
				if (that.checkEquipment.time >= 10) {
					this.longToast.toast()
					yield showModal({
						title: '提示',
						content: '配网失败',
						showCancel: false,
						confirmColor: '#ff9999'
					})
					return	wxNav.navigateTo('/pages/package_device/network/tips/step1')
				}
				setTimeout(function () {
					that.checkEquipment(sn)
				}, 2000)
			} else {
				this.longToast.toast()
				wx.showToast({
					title: '配网成功',
					duration: 5000,
				})
			}
		} catch (e) {
			this.longToast.toast()
			console.log('echeckEquipment======', e)
			wxNav.navigateTo('/pages/package_device/network/tips/step1')
			return
		}
	}),
})
