/*
 * @Author: your name
 * @Date: 2019-12-18 13:54:55
 * @LastEditTime: 2019-12-19 14:43:06
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/pages/finish/index.js
 */
// pages/finish/index.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')

const chooseImage = util.promisify(wx.chooseImage)
const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const getImageInfo = util.promisify(wx.getImageInfo)
const getNetworkType = util.promisify(wx.getNetworkType)


Page({
	data: {
		owner: false,
		audit_free: false,
		state: '',
		supply_types: '',
		subscribe: false,
		describe: false,
		appId: 'wxde848be28728999c',
		shopId: 24056376,
		openId: '',
		activeDevice: null,
		printType: '',
		showAdvertisement: true,
		showOfflineWay: false //默认不展示离线解决方案入口，展示维保入口
	},
	media_type: '',
	onLoad: function (options) {
		// this.longToast = new app.WeToast()
		// console.log('options=======', options)
		// console.log(options.media_type)
		// // console.log(options.type)
		// // console.log(options.category_id)
		// this.media_type = options.media_type
		// this.printType = options.type
		// if (this.printType) {
		// 	this.setData({
		// 		printType: this.printType
		// 	})
		// }
		// this.category_id = options.category_id
		// this.setData({
		// 	// owner: app.activeDevice.owner,
		// 	// audit_free: app.activeDevice.audit_free
		// 	state: options.state
		// })
		// // console.log('00000', app.activeDevice.owner)
		// if (options.media_type) {
		// 	wx.removeStorageSync(options.media_type)
		// }
		// if (options.sticker_type) {
		// 	wx.removeStorageSync(options.sticker_type)
		// }
		// this.loopGetOpenId()

		// this.getAccounts()
		// mta.Page.init()
		// let getSupplyAfter = commonRequest.getSupplyAfter()
		// let that = this
		// getSupplyAfter.then(function (res) {
		// 	const supply_types = res.supply_types
		// 	console.log(supply_types)
		// 	that.setData({
		// 		supply_types: supply_types
		// 	})
		// })
		// try {
		// 	app.gio('track', 'onLoadFinsih', {})
		// } catch (e) {}

	},

	backToHome:function(){
     wx.switchTab({
			 url: '/pages/index/index',
			 success: function(res){
				 // success
			 },
			 fail: function() {
				 // fail
			 },
			 complete: function() {
				 // complete
			 }
		 })
	}
})