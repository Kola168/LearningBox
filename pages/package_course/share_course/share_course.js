	// pages/error_book/pages/course/share_course/share_course.js
	import {
		regeneratorRuntime,
		co,
		util
	} from '../../../utils/common_import'
	const app = getApp()
	var timer
	const event = require('../../../lib/event/event')
	import graphql from '../../../network/graphql_request'
	import storage from '../../../utils/storage'
	import router from '../../../utils/nav'
	import Logger from '../../../utils/logger.js'
	const logger = new Logger.getLogger('pages/package_course/share_course/share_course')
	Page({
		data: {
			is_android: false, //是否是安卓平台
			time: '00:00',
			shareInfo: null,
			sn: null, // 课程标示
			endTime: null,
			introduction: null,
			isClick: false, //多次点击状态
			isAuth: false, //是否授权
			share_user_id: null,
			emitSuccess: false // 是否点击助力
		},
		onLoad: co.wrap(function* (options) {
			var _this = this
			var unionId = storage.get("unionId")

			_this.longToast = new app.weToast()
			_this.setData({
				sn: options.sn,
				share_user_id: options.share_user_id || '',
				// isAuth: !!unionId
				isAuth: true
			})

			event.on('Authorize', this, function (data) {
				this.setData({
					isAuth: true
				})
			})

			// if (unionId && options.share_user_id) { // 上报小白客与推广客关系
			// 	commonRequest.updateUserIdRelationship(unionId, options.share_user_id)
			// }

		}),

		onShow: co.wrap(function* () {
			this.init()
		}),

		init: function () {
			this.verifyPlat()
			this.data.sn && this.getShareInfo()
		},

		// 设备标示
		verifyPlat: function () {
			try {
				var _this = this
				var systemInfo = wx.getSystemInfoSync()
				_this.setData({
					is_android: systemInfo.system.indexOf('iOS') > -1 ? false : true
				})
			} catch (err) {
				logger.info(err)
			}
		},

		//  倒计时
		countDown(callback = function () {}) {
			var _this = this
			var end_ts = _this.data.endTime * 1000
			var format = function (num) {
				return +num >= 10 ? num : ('0' + num)
			}
			var count = function (end_ts) {
				var now_ts = new Date().getTime()
				if (now_ts > end_ts) return timer && clearTimeout(timer);
				var mm = Math.floor((end_ts - now_ts) / 1000 / 60)
				var ss = Math.floor((end_ts - now_ts) / 1000 % 60)
				var time = `${format(mm)}:${format(ss)}`
				timer = setTimeout(count.bind(null, end_ts), 1000)
				callback.apply(_this, [time])
			}
			return count(end_ts)
		},

		// 获取分享信息
		getShareInfo: co.wrap(function* () {
			var _this = this
			try {
				_this.longToast.toast({
					type: 'loading',
					title: '加载中...'
				})
		
				var res = yield graphql.getAssistanceInfo(_this.data.sn)
				_this.setData({
					shareInfo: res.courseShare,
					endTime: res.courseShare.endAtTimestamp,
					introduction: res.courseShare && res.courseShare.course.introduction.replace(/alt=""/g, `style="max-width:100%;vertical-align:middle;"`)
				})



					// 助力完成不计时
					!res.assistanceSucceed && _this.countDown(function (time) {
						_this.setData({
							time: time
						})
					})
			} catch (err) {
				logger.info(err)
			} finally {
				_this.longToast.hide()
			}
		}),

		auth: function () {
			var _this = this
			var share_user_id = _this.data.share_user_id
			return new Promise((resolve, reject) => {
				if (!_this.data.isAuth) {
					router.navigateTo('/pages/authorize/index', share_user_id ? {
						share_user_id: share_user_id
					} : '')
				
					reject()
				} else {
					resolve()
				}
			})
		},

		// 去助力
		toHelper() {
			var _this = this
			try {
				if (!this.data.shareInfo.owner) {
					_this.auth().then(() => {
						var text = null
						if (_this.data.shareInfo) {
							if (_this.data.shareInfo.assistanceSucceed) {
								text = '助力活动结束，您不可助力'
							} else if (!_this.data.shareInfo.canAssistance) {
								text = '你已经参与助力！'
							}
						}

						if (!_this.data.isClick) {
							_this.data.isClick = true
							_this.sendHelper()
						}

						if (text) {
							return wx.showToast({
								title: text,
								icon: 'none',
							})
						}
					})
				}
			} catch (err) {
				logger.info(err)
			}

		},

		// 发起助力
		sendHelper: co.wrap(function* () {
			var _this = this
			try {
				_this.longToast.toast({
					type: 'loading',
					title: '加载中...'
				})
				
				const res = yield graphql.sendCourseAssistance(_this.data.sn)
				if (!res) {
					throw (res)
				}
				wx.showToast({
					title: '助力成功',
					icon: 'success',
					duration: 3000
				})
				_this.getShareInfo() //更新数据

			} catch (err) {
				logger.info('助力失败', err)
				util.showError({
					message: '助力失败'
				})
				_this.data.isClick = false

			} finally {
				_this.longToast.hide()
			}
		}),

		// 去学习
		toLearn() {
			var sn = this.data.shareInfo.course.sn
			router.navigateTo('/pages/package_course/course/course', {
				isContinue: 0,
				sn: sn
			})
		
		},

		// 返回首页
		backIndex() {
			router.reLaunch('/pages/index/index')
		
		},

		onUnload() {
			timer && clearTimeout(timer)
		},

		onHide() {
			timer && clearTimeout(timer)
		}
	})