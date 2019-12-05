// pages/authorize/index.js
"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')

const request = util.promisify(wx.request)
const checkSession = util.promisify(wx.checkSession)
var event = require('../../lib/event/event.js')


Page({
	data: {

	},

	onLoad: co.wrap(function* (options) {
		this.longToast = new app.WeToast()
		mta.Page.init()
		this.way = 1 //默认都是自然用户
		this.showBack = options.showBack
		console.log('授权页面options========', options)
		this.url = options.url
		if (options.way == 5 && options.share_user_id) {
			this.share_user_id = options.share_user_id
			this.way = options.way
		}
	}),

	onShow: co.wrap(function* () { }),

	authorize: co.wrap(function* (e) {
		this.detail = e.detail
		console.log('detail======', this.detail)
		if (!e.detail.userInfo || !e.detail.encryptedData) {
			return
		}
		yield this.loopGetOpenId()
	}),

	hideModal: co.wrap(function* (e) {
		console.log('未授权页面授权时form发生了submit事件，携带数据为：', e.detail.formId, 'authorize')
		this.authorizeFormId = e.detail.formId
	}),

	loopGetOpenId: co.wrap(function* () {
		let loopCount = 0
		let _this = this
		if (app.openId) {
			console.log('openId++++++++++++----', app.openId)
			yield _this.decrypt()
			return
		} else {
			setTimeout(function () {
				loopCount++
				if (loopCount <= 100) {
					console.log('openId not found loop getting...')
					_this.loopGetOpenId()
				} else {
					console.log('loop too long, stop')
				}
			}, 2000)
		}
	}),
	checkSession: co.wrap(function* () {
		try {
			yield checkSession()
			return true
		} catch (e) {
			console.log('need login', e)
			return false
		}
	}),
	decrypt: co.wrap(function* () {
		this.longToast.toast({
			img: '../../images/loading.gif',
			title: '请稍候',
			duration: 0
		})
		let session = yield this.checkSession()
		console.log('seesion是否有效', session)
		if (!session) {
			yield app.login()
		}
		try {
			let white_guests_info = {
				way: this.way
			}
			if (this.share_user_id && (this.way == 3 || this.way == 4 || this.way == 5)) {
				white_guests_info.user_id = this.share_user_id
			}
			let params = {
				openid: app.openId,
				encrypted_info: {
					encrypted_data: encodeURIComponent(this.detail.encryptedData),
					iv: encodeURIComponent(this.detail.iv),
				},
				white_guests_info: white_guests_info,
				mobile_info: {
					device_type: app.sysInfo.model,
					os_version: app.sysInfo.system,
					sdk_version: app.sysInfo.SDKVersion,
					platform: app.sysInfo.platform,
					wx_version: app.sysInfo.version,
					app_version: app.version
				},
				action: 'login'
			}

			console.log('sp授权参数：way1自然用户，way2小白客，way3分享打印机，way4分享首页，way5分享应用', params)

			const resp = yield request({
				url: app.apiServer + `/boxapi/v2/users/decryption`,
				method: 'POST',
				dataType: 'json',
				data: params
			})
			if (resp.data.code != 0) {
				throw (resp.data)
			}
			console.log('授权成功', resp.data)
			wx.setStorageSync('authToken', resp.data.res.auth_token)
			wx.setStorageSync('unionId', resp.data.res.unionid)
			wx.setStorageSync('userId', resp.data.res.user_id)
			if(resp.data.res.selected_stage.sn){
				wx.setStorageSync('selectedStage', resp.data.res.selected_stage.sn)
			}
			if (resp.data.res.phone) {
				app.hasPhoneNum = true
				app.globalPhoneNum = resp.data.res.phone
				wx.setStorageSync("phonenum", resp.data.res.phone)
			}
			this.loopUploadOpenId() //上报formid
			this.userId = resp.data.res.user_id
			try {
				this.loopGrowingOpenId(resp.data.res.union_id)

			} catch (error) {

			}
			this.longToast.toast()
			console.log('111111111111')
			event.emit('Authorize', 'Authorize Success');
			console.log('222222222222')
			wx.navigateBack();
		} catch (e) {
			yield app.login()
			yield showModal({
				title: '授权失败',
				content: '请重新尝试',
				confirmColor: '#2086ee',
				confirmText: "确认",
				showCancel: false
			})
			this.setData({
				showGetModal: true
			})
			this.longToast.toast()
			util.showErr(e)
		}
	}),

	onUnload: function () {
		this.detail = ''
	},


	loopUploadOpenId: co.wrap(function* () {
		let loopCount = 0
		let _this = this
		if (app.openId) {
			console.log('绑定分享 openId++++++++++++----', app.openId)
			if (_this.authorizeFormId) {
				uploadFormId.dealFormIds(_this.authorizeFormId, `authorize`)
				uploadFormId.upload()
				console.log('未授权页面授权时上报，携带数据为：', this.authorizeFormId, 'authorize')
			}
		} else {
			setTimeout(function () {
				loopCount++
				if (loopCount <= 100) {
					console.log('openId not found loop getting...')
					_this.loopUploadOpenId()
				} else {
					console.log('loop too long, stop')
				}
			}, 2000)
		}
	}),
	loopGrowingOpenId: co.wrap(function* (unionId) {
		let loopCount = 0
		let _this = this
		if (app.openId) {
			console.log('loopGrowingOpenId openId++++++++++++----', app.openId)
			app.gio('identify', app.openId, unionId)
			app.gio('setUserId', app.openId)
			wx.getUserInfo({
				success: function (res) {
					app.gio('setVisitor', res.userInfo)
				}
			})
		} else {
			setTimeout(function () {
				loopCount++
				if (loopCount <= 100) {
					console.log('openId not found loop getting...')
					_this.loopGrowingOpenId()
				} else {
					console.log('loop too long, stop')
				}
			}, 2000)
		}
	}),

	backTo: function () {
		wx.navigateBack()
	}

})