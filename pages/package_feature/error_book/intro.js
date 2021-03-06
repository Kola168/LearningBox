// pages/error_book/pages/error_book/intro.js
"use strict"
const co = require('../../../lib/co/co')
const regeneratorRuntime = require('../../../lib/co/runtime')
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

Page({
	data: {
		from_temp: false,
		// error_book:错题本首次上传图片
		// topic_details:错题详情页补充图片
		// photo_answer:拍搜
		from: '',
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
			return router.navigateTo('/pages/authorize/index', {
				url: url,
				share_user_id: this.share_user_id,
				way: this.way
			})
		} else {
			let errorBook = {
				hideIntro: true,
				hideHomeTip: false,
				hideCameraTip: false
			}
			wx.setStorageSync('errorBook', errorBook)
			return router.redirectTo('/pages/package_feature/error_book/index')
		}
	},
	onShareAppMessage: function () {

	}
})