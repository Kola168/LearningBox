// pages/finish/index.js
"use strict"

const app = getApp()
const feature_route = require('../../utils/feature_index')
import {
	regeneratorRuntime,
	co,
	util,
	storage,
	wxNav
} from '../../utils/common_import'
const imginit = require('../../utils/imginit')
const chooseImage = util.promisify(wx.chooseImage)
const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const getImageInfo = util.promisify(wx.getImageInfo)
const getNetworkType = util.promisify(wx.getNetworkType)
// import gql from '../../network/graphql_request'
// import commonRequest from '../../utils/common_request'
const downloadFile = util.promisify(wx.downloadFile)
const getSetting = util.promisify(wx.getSetting)
const authorize = util.promisify(wx.authorize)

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function () {}

Page({
	data: {
		exerciseDay: 0,
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
		continueText: null,
		allowCamera: 0,
	},
	media_type: '',
	onLoad: function (options) {
		console.log(options)
		this.longToast = new app.weToast()
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
		if (options.media_type == 'baobeicepin') {
			this.setData({
				continueText: '再次测评'
			})
		}
		if (options.type == 'cert_id') {
			this.url = decodeURIComponent(options.url)
			this.getAuth()
		}
		this.initExerciseStatus()
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

	initExerciseStatus: co.wrap(function* () {
		try {
			var mediaTypes = ['daily_practice'] //练习相关的media_types
			var isExercise = mediaTypes.indexOf(this.media_type) > -1
			var orderData = storage.get('orderSuccessParams')
			this.setData({
				isExercise,
				exerciseDay: orderData.statistic && orderData.statistic.keepDays
			})
			storage.remove('orderSuccessParams')
		} catch (err) {

		}
	}),

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
	// 保存图片授权
	getAuth: co.wrap(function* () {
		try {
			let setting = yield getSetting()
			let camera = setting.authSetting['scope.writePhotosAlbum']
			if (camera === undefined) {
				this.allowCamera = 0
				let auth = yield authorize({
					scope: 'scope.writePhotosAlbum'
				})
				this.allowCamera = 2
			} else if (camera === false) {
				this.allowCamera = 1
			} else {
				this.allowCamera = 2
			}
			this.setData({
				allowCamera: this.allowCamera
			})
			console.log(' 0 未授权 1，授权失败， 2 已授权', this.allowCamera)
		} catch (e) {
			console.log('获取授权/授权失败', e)
			this.allowCamera = 1
			this.setData({
				allowCamera: this.allowCamera
			})
		}
	}),
	authBack: function (e) {
		console.log(e)
		if (!e.detail.authSetting['scope.writePhotosAlbum']) {
			return
		}
		this.setData({
			allowCamera: 2
		})
		this.savePhoto(e)
	},
	//保存图片
	savePhoto: co.wrap(function* (e) {
		let id = e.currentTarget.id
		let url = this.url
		let data = yield downloadFile({
			url
		})
		wx.saveImageToPhotosAlbum({
			filePath: data.tempFilePath,
			success(res) {
				wx.showModal({
					title: '提示',
					content: '保存成功',
					showCancel: false,
					confirmColor: '#fae100'
				})
			},
			fail(e) {
				wx.showModal({
					title: '保存失败',
					content: '请稍后重试',
					showCancel: false,
					confirmColor: '#fae100',
				})
			}
		})
	}),
})