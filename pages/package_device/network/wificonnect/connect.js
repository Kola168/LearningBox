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
		// console.log(options)
		this.equipInfo = JSON.parse(decodeURIComponent(options.equipInfo))
		this.wifiSSID = JSON.parse(decodeURIComponent(options.wifiSSID))
		this.setData({
			wifiSSID: this.wifiSSID
		})
		// console.log(this.equipInfo)
	},

	inputprintNum: function (e) {
		// console.log(e)
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
				this.networkManage()  //设置成功后检查网络的物理状态
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

		//检查网络状态
		networkManage: co.wrap(function* () {
			var that = this;
			//监听网络状态
			wx.onNetworkStatusChange(function (res) {
				console.log('执行到这里===========55555===', res)
				if (!res.isConnected) {
					console.log('网络似乎不太顺畅');
					return false
				} else {
					//在网络通的情况下，并且1500毫秒还是有网
					wx.offNetworkStatusChange()
					that.bindCode()
				}
			})
		}),

		//上报code信息
	bindCode: co.wrap(function* () {
		let deviceInfo = {
			serviceSn: this.equipInfo.DeviceID,
			bindCode: this.equipInfo.BindCode,
			serviceType: 'gcp',
		}
		try {
			let res = yield graphql.bindDevice(deviceInfo)
			console.log('上报盒子信息返回的======', res)
			let sn = res.bindDevice.device.sn
			this.checkEquipment(sn)
		} catch (e) {
			console.log('bindCode错误===',e)
			if(e === 'customize-timeout'){  //自定义3秒超时,30次
				if (!that.bindCode.time) {
					that.bindCode.time = 0
				}
				that.bindCode.time++
				if (that.bindCode.time >= 30) {
					this.longToast.toast()
					wx.showModal({
						title: '提示',
						content: '配网超时',
					})
					this.longToast.toast()
					setTimeout(function(){
						return wxNav.navigateTo('/pages/package_device/network/tips/step1')
					},1000)
				}else{
					console.log('that.bindCode.time====',that.bindCode.time)
					that.bindCode()
				}
			}else if(e.errMsg === "request:fail timeout" || e.errMsg === "request:fail"){
				wx.showModal({
					title: '提示',
					content: '配网中断',
				})
			}else{//其它未知错误
				return wxNav.navigateTo('/pages/package_device/network/tips/step1')
			}
		}
	}),

	//轮询获取盒子在线状态
	checkEquipment: co.wrap(function* (sn) {
		try {
			let res = yield graphql.getDeviceDetail(sn)
			console.log('获取打印机详细信息', res.currentUser.devices[0])
			console.log('获取打印机状态', res.currentUser.devices[0].onlineState)

			if (res.currentUser.devices[0].onlineState != 'online') {
				let that = this
				if (!that.checkEquipment.time) {
					that.checkEquipment.time = 0
				}
				that.checkEquipment.time++
				if (that.checkEquipment.time >= 30) {
					this.longToast.toast()
					yield showModal({
						title: '提示',
						content: '配网失败',
						showCancel: false,
						confirmColor: '#ff9999'
					})
					return wxNav.navigateTo('/pages/package_device/network/tips/step1')
				}
				setTimeout(function () {
					that.checkEquipment(sn)
				}, 3000)
			} else {
				this.longToast.toast()
				wx.showToast({
					title: '配网成功',
					duration: 2000,
				})
				wxNav.switchTab('/pages/index/index')
			}
		} catch (e) {
			this.longToast.toast()
			console.log('echeckEquipment======', e)
			wxNav.navigateTo('/pages/package_device/network/tips/step1')
			return
		}
	}),
})
