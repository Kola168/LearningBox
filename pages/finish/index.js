// pages/finish/index.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const feature_route=require('../../utils/feature_index')

const chooseImage = util.promisify(wx.chooseImage)
const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const getImageInfo = util.promisify(wx.getImageInfo)
const getNetworkType = util.promisify(wx.getNetworkType)

import wxNav from '../../utils/nav.js'
import storage from '../../utils/storage.js'
import gql from '../../network/graphql_request'
import commonRequest from '../../utils/common_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({
	data: {
		owner: false,
		audit_free: false,
		state: '',
		supply_types: '',
		// subscribe: false,
		describe: false,
		openId: '',
		activeDevice: null,
		printType: '',
		showAdvertisement: true,
	},
	media_type: '',
	onLoad: function (options) {
		this.longToast = new app.weToast()
		Loger('options=======', options)
		Loger(options.media_type)
		this.media_type = options.media_type
		this.printType = options.type
		if (this.printType) {
			this.setData({
				printType: this.printType
			})
		}
		this.category_id = options.category_id
		this.setData({
			state: options.state
		})
		if (options.media_type) {
			wx.removeStorageSync(options.media_type)
		}
		if (options.sticker_type) {
			wx.removeStorageSync(options.sticker_type)
		}

		// this.getAccounts()
		// let getSupplyAfter = commonRequest.getSupplyAfter()
		// let that = this
		// getSupplyAfter.then(function (res) {
		// 	const supply_types = res.supply_types
		// 	Loger(supply_types)
		// 	that.setData({
		// 		supply_types: supply_types
		// 	})
		// })
		// try {
		// 	app.gio('track', 'onLoadFinsih', {})
		// } catch (e) {}

	},
	onShow() {
		this.setData({
			activeDevice: app.activeDevice
		})

	},

	// getAccounts: co.wrap(function* () {
	// 	this.longToast.toast({
	// 		img: '../../images/loading.gif',
	// 		title: '请稍候',
	// 		duration: 0
	// 	})
	// 	try {
	// 		const resp = yield request({
	// 			url: app.apiServer + `/ec/v2/users/user?openid=${app.openId}`,
	// 			header: {
	// 				'G-Auth': app.authAppKey
	// 			},
	// 			method: 'GET',
	// 			dataType: 'json',
	// 			data: {
	// 				openid: app.openId
	// 			}
	// 		})
	// 		if (resp.data.code != 0) {
	// 			throw (resp.data)
	// 		}
	// 		this.longToast.toast()
	// 		Loger('用户是否关注公众号', resp.data)
	// 		this.setData({
	// 			subscribe: resp.data.user.subscribe
	// 		})
	//
	// 	} catch (e) {
	// 		util.showErr(e)
	// 		this.longToast.toast()
	// 	}
	// }),
	backToHome: function () {
		wxNav.switchTab('/pages/index/index')
	},

	continuePrint: function () {
		wxNav.backPage(feature_route.feature_route[this.media_type])
	},

	onShareAppMessage: function () {
		return app.share
	},

	toDetail: function () {
		this.setData({
			describe: !this.data.describe
		})
	},

	order: function (e) {
		let id = e.currentTarget.id
		let alias = this.data.supply_types[id].alias
		// Loger(alias, this.data.shopId, this.data.appId, this.data.openId)
		// let unionId = wx.getStorageSync('unionId')
		// Loger('商城授权')
		// if (!unionId) {
		// 	let url = `/pages/authorize/index`
		// 	wx.navigateTo({
		// 		url: url,
		// 	})
		// } else {
		// 	wx.navigateTo({
		// 		url: `/pages/cart/transit/transit?pageType=goodsDetail&goodsId=${alias}&openId=${this.data.openId}&shopId=${this.data.shopId}&appId=${this.data.appId}`
		// 	})
		// }
	},

})
