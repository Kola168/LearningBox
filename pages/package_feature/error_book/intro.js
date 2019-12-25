// pages/error_book/pages/error_book/intro.js
"use strict"
const co = require('../../../lib/co/co')
const regeneratorRuntime = require('../../../lib/co/runtime')

Page({
	data: {
		from_temp: false
	},
	onLoad: co.wrap(function* (options) {
		this.way = 1
		if (options.scene) {
			let fromScene = decodeURIComponent(options.scene)
			console.log("4567890错题本", fromScene)
			let scene = fromScene.split('_')
			this.from = scene[0]
			if (this.from == 'application') {
				this.share_user_id = scene[1]
				this.way = 5
				console.log('错题本应用二维码参数', this.share_user_id, this.way)
				this.setData({
					from_temp: true
				})
			}
		}

		yield this.getUnion()
	}),
	toNextPage: function () {
		let unionId = wx.getStorageSync('unionId')
		if (!unionId) {
			let url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
			return wx.navigateTo({
				url
			})
		}else{
			let errorBook = {
				hideIntro: true,
				hideHomeTip: false,
				hideCameraTip: false
			}
			wx.setStorageSync('errorBook', errorBook)
			return wx.redirectTo({
				url: `index`
			})
		}
	},
	onShareAppMessage: function () {

	},
	backToHome: function () {
		wx.switchTab({
			url: '../../index/index'
		})
	}
})