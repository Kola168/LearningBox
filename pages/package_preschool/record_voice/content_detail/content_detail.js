// pages/library/play_preview.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'

import graphql from '../../../../network/graphql_request'

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
import commonRequest from '../../../../utils/common_request.js'
const event = require('../../../../lib/event/event')
import storage from '../../../../utils/storage'
import router from '../../../../utils/nav'
Page({
	data: {
		user: null, //用户信息
		recordDetails: {},
		collection: false,
		num: 0,
		circular: true,
		showGetModal: false, //耗材推荐弹窗
		supply_types: '',
		showConsumable: false,
		showSetting: false, //显示打印设置
		documentPrintNum: 1, //打印份数
		startPrintPage: 1,
		endPrintPage: 1,
		colorCheck: 'Color', //默认彩色
		duplexCheck: false,
		isColorPrinter: true,
		isDuplex: true,
		userSn: '',
		userAuthorize: false,
		confirmModal: {
			isShow: false,
			title: '请正确放置A4打印纸',
			image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
		},
		isAndroid: false,
		isMember: false,
		member: true,
		discountType: null,
		discount: null,
		kidInfo: null, //宝宝信息
		isFullScreen: false,
	},
	onLoad: co.wrap(function* (options) {
		var systemInfo = wx.getSystemInfoSync()
		this.longToast = new app.weToast()
		this.setData({
			title: decodeURIComponent(options.title),
			isFullScreen: app.isFullScreen,
			isAndroid: systemInfo.system.indexOf('iOS') > -1 ? false : true
		})

		this.sn = options.sn //分类sn
		this.title = decodeURIComponent(options.title)

		wx.setNavigationBarTitle({
			title: this.title
		})
		this.longToast = new app.weToast()
		let userSn = storage.get('userSn')
		if (userSn) {
			yield this.getRecordSource()
			yield this.getConsumables()
			yield this.getUserInfo()
		}

		//授权成功后回调
		event.on('Authorize', this, function (data) {
			this.getRecordSource()
			 this.getConsumables()
			 this.getUserInfo()
		})

	}),

	/**
	 * 获取宝宝信息
	 */
	getUserInfo: co.wrap(function* () {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      let resp = yield graphql.getUser()
      this.setData({
        kidInfo: resp.currentUser.selectedKid,
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
	}),

	/**
	 * 获取内容详情
	 */
	getRecordSource: co.wrap(function*(){
		this.longToast.toast({
      type: 'loading',
      title: '请稍候'
		})

		try {
			var resp = yield graphql.getRecordSource(this.sn)

			this.setData({
				content: resp.content,
				collection: resp.content.contentCollected
			})
			this.longToast.hide()
		} catch(err) {
			this.longToast.hide()
			util.showError(err)
		}
	}),

	onShow: co.wrap(function*() {


    var auth = yield this.authCheck()

    auth && this.setData({
      userAuthorize: true
    })
  }),

	tabSlide: function ({detail: {current}}) {
		this.setData({
			num: current
		})
  },

	turnImg: co.wrap(function* (e) {
		let num = this.data.num;
		let turn = e.currentTarget.dataset.turn;
		if (turn == 'right') {
			if (num < this.data.detail.preview_urls.length - 1) {
				num++;
			} else {
				return
			}
		} else if (turn == 'left') {
			if (num > 0) {
				num--;
			} else {
				return
			}
		}
		this.setData({
			num: num,
			turn: turn
		})
  }),

	collect: co.wrap(function* () {
    var auth = yield this.authCheck()
    if (!auth) {
      return
    }

		this.longToast.toast({
			type: 'loading',
			title: '请稍等'
		})
		try {
			var collection = this.data.collection
			yield graphql.collect(this.sn, 'content', collection ? 'destroy' : 'create')

			this.longToast.hide()
			let tipText = collection ? '取消收藏成功' : '收藏成功'
			wx.showToast({
				icon: 'none',
				title: tipText
			})
			this.setData({
				collection: !collection
			})

		} catch (error) {
			this.longToast.hide()
			util.showError(error)
		}
  }),

	toConfirm: co.wrap(function* (e) {
    var auth = yield this.authCheck()
    if (!auth) {
      return
    }
		this.setData({
			showSetting: true
		})
	}),

  authCheck: co.wrap(function *(){
    var userSn = storage.get('userSn')
		if (!userSn) {
			let url = `/pages/authorize/index`
			router.navigateTo(url)
      return false
    }
    return true
  }),

	closeIosTip: function () {
		this.setData({
			showIosTip: false
		})
  },

	print: co.wrap(function* (e) {
		try {
			this.longToast.toast({
				type: 'loading',
				title: '请稍候'
			})

			var _this = this
			var params = {
        resourceAttribute: {
          resourceType: 'Content',
					sn: this.sn,
					duplex: _this.data.duplexCheck,
					copies: _this.data.documentPrintNum,
					startPage: _this.data.startPrintPage,
					endPage: _this.data.endPrintPage,
					grayscale: _this.data.colorCheck == 'Color' ? false : true,
        },
        featureKey: "kid_record"
      }
      var resp = yield graphql.createResourceOrder(params)

			router.redirectTo('/pages/finish/index', {
				media_type: this.data.media_type,
				state: resp.createResourceOrder.state
			})

		} catch (e) {
			this.longToast.hide()
			util.showError(e)
		}
	}),

	/**
	 * 跳转头像编辑
	 */
	toEditAvatar: function() {
		router.navigateTo('pages/package_common/account/name_edit')
	},

	/**
	 * 打开耗材弹窗
	 */
	openConsumable: function() {
		this.setData({
			showConsumable: true
		})
	},

		/**
	 * 关闭耗材弹窗
	 */
	closeConsumable: function() {
		this.setData({
			showConsumable: false
		})
	},

	getConsumables: co.wrap(function*(){
		this.longToast.toast({
      type: 'loading',
      title: '请稍候'
		})

		try {
			var resp = yield graphql.getConsumables("content", this.sn, 'before')

			this.setData({
				supply_types: resp.consumables
			})
			this.longToast.hide()
		} catch(err) {
			this.longToast.hide()
			util.showError(err)
		}
	}),

	//获取打印能力
	getCapability: co.wrap(function* () {
		this.longToast.toast({
			type: 'loading',
			title: '请稍候',
		})
		try {
			const resp = yield commonRequest.getPrinterCapacity({
        printer_id: app.activeDevice.id,
        printer_type: app.activeDevice.printer_type
			})
			if (resp.code != 0) {
				throw (resp)
      }
			this.longToast.hide()
			this.setData({
				isColorPrinter: resp.print_capability.color_modes.length == 2 ? true : false,
				isDuplex: resp.print_capability.media_sizes[0].duplex ? true : false
			})
		} catch (e) {
			this.longToast.hide()
			util.showError(e)
		}
	}),

	//减少份数
	cutPrintNum: function () {
		if (this.data.documentPrintNum <= 1) {
			return
		}
		this.data.documentPrintNum -= 1
		this.setData({
			documentPrintNum: this.data.documentPrintNum
		})
	},

	//增加份数
	addPrintNum: co.wrap(function* () {
		this.data.documentPrintNum += 1
		if (this.data.documentPrintNum <= 30) {
			this.setData({
				documentPrintNum: this.data.documentPrintNum
			})
		} else {
			this.setData({
				documentPrintNum: 30
			})
			yield showModal({
				content: '每次最多打印30份',
				confirmColor: '#2086ee',
				confirmText: "确认",
				showCancel: false
			})
		}
  }),

	//输入打印起始页
	inputStartPage: function (e) {
		this.data.startPrintPage = e.detail.value
	},

	startPageJudge: function (e) {
		if (parseInt(e.detail.value) > parseInt(this.data.endPrintPage) || parseInt(e.detail.value) <= 0) {
			this.setData({
				startPrintPage: 1,
			})
			wx.showModal({
				content: '请输入正确的起始页',
				confirmColor: '#2086ee',
				confirmText: "确认",
				showCancel: false
			})

		} else {
			this.data.startPrintPage = e.detail.value
		}
	},

  //输入打印结束页
	inputEndPage(e) {
		this.data.endPrintPage = e.detail.value
  },

	endPageJudge(e) {
		if (parseInt(e.detail.value) < parseInt(this.data.startPrintPage) || parseInt(e.detail.value) > this.data.detail.preview_urls.length) {
			this.setData({
				endPrintPage: this.data.content.contentImage.length,
			})
			wx.showModal({
				content: '请输入正确的结束页',
				confirmColor: '#2086ee',
				confirmText: "确认",
				showCancel: false
			})
		} else {
			this.data.endPrintPage = e.detail.value
		}
	},

	//选择颜色
	colorCheck(e) {
		this.setData({
			colorCheck: e.currentTarget.dataset.style
		})
	},

	//选择单双面打印模式
	duplexCheck(e) {
		let duplexCheck = e.currentTarget.dataset.style == '0' ? false : true
		this.setData({
			duplexCheck: duplexCheck
		})
	},

	//确认按钮提交
	confCheck() {

    if (this.data.startPrintPage == '') {
      return wx.showModal({
        content: '请输入正确的开始页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })

    }

    if (this.data.endPrintPage == '') {
      return wx.showModal({
        content: '请输入正确的结束页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })

    }

		let hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
		if (hideConfirmPrintBox) {
			this.print()
		} else {
			this.setData({
				['confirmModal.isShow']: true
			})
		}
  },

	cancelCheck() {
		this.setData({
			showSetting: false
		})
	},

	onShareAppMessage: co.wrap(function* (res) {
		res = res[0]
		if (res.from === 'button') {
			this.longToast.toast({
				img: '/images/loading.gif',
				title: '请稍候',
				duration: 0
			})
			return {
				title: this.title,
				path: `/pages/package_preschool/record_voice/content_detail/content_detail?sn=${this.sn}&title=${this.title}`
			}
		} else {
			return app.share
		}

  }),

	onUnload: function () {
		event.remove('Authorize', this)
	}
})
