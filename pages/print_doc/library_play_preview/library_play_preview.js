// pages/library/play_preview.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql_request'
// import commonRequest from '../../../utils/common_request.js'

import storage from '../../../utils/storage'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/print_doc/library_play_preview/library_play_preview')
// var mta = require('../../../utils/mta_analysis.js');

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const requestPayment = util.promisify(wx.requestPayment)
const event = require('../../../lib/event/event')

Page({
	data: {
		detail: {},
		// type: '_learning', //值为_learning时为试卷,其他时候为空，仅用于页面判断
		collection: false,
		num: 0,
		circular: true,
		showGetModal: false, //耗材推荐弹窗
		supply_types: '',
		consumablesIcon: false, //耗材推荐图标
		from: '',
		backHome: false,
		toMoreList: false,
		showSetting: false, //显示打印设置
		documentPrintNum: 1, //打印份数
		startPrintPage: 1,
		endPrintPage: 1,
		colorcheck: 'Color', //默认彩色
		duplexcheck: false,
		isColorPrinter: true,
		isDuplex: true,
		as_type: 'common', //试卷类型
		is_3115: false, //本字段现用来判断是否为会员
		unionId: '',
		userAuthorize: true,
		hasAuthPhoneNum: false,
		confirmModal: {
			isShow: false,
			title: '请正确放置A4打印纸',
			image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
		},
		isAndroid: false,
		isMember: false,
		member: true,
		discountType: null,
		discount: null,
    memberExpiresAt:null,
    title: null,
	},
	onLoad: co.wrap(function* (options) {
    logger.info('99999预览模板id', options)
		this.setData({
			title: options.title,
			type: options.type ? options.type : '',
			as_type: options.as_type ? options.as_type : 'common'
		})
		let systemInfo = wx.getSystemInfoSync()
		this.setData({
			isAndroid: systemInfo.system.indexOf('iOS') > -1 ? false : true
		})
		this.id = options.id //试卷/内容单个id
		this.sn = options.sn //分类sn
		this.title = options.title
		this.share_user_id = options.user_id
		this.type_id = options.type_id //父级id
		this.way = 1 //默认自然用户
		if (this.share_user_id) {
			this.setData({
				backHome: true
			})
			this.way = 5
		}
		if (['library_index', 'search'].indexOf(options.from) > -1) {
			this.setData({
				toMoreList: true
			})
		}
	this.setData({
			title: options.title
		})
		this.longToast = new app.WeToast()
		let unionId = storage.get('unionId')
		if (unionId) {
			yield this.loopGetOpenId()
		}

		mta.Page.init()

		//授权成功后回调
		event.on('Authorize', this, function (data) {
			this.updateDetail()
		})

		var resource_category_sn = this.sn
		this.setData({
			mediumRecommend: resource_category_sn
		})
		// let getSupplyBeforeFind = commonRequest.getSupplyBeforeFindSn(resource_category_sn)
		// let that = this
		// getSupplyBeforeFind.then(function (res) {
		// 	const supply_types = res.supply_types
		// 	console.log(supply_types)
		// 	that.setData({
		// 		supply_types: supply_types
		// 	})
		// })

		if (unionId) {
			try {
				this.loopGrowingOpenId(unionId)
			} catch (error) {}
		}

	}),

	updateDetail: co.wrap(function* () {
		this.longToast.toast({
			type: 'loading',
			title: '请稍候'
		})
		this.getUserId()
		this.member()
		if (!app.activeDevice) {
			yield this.getDevice()
		}
		if (this.data.type == '_learning') {
			yield this.getShijuanDetail()
		} else {
			yield this.getDetail()
		}

		if (app.activeDevice) {
			yield this.getCapability()
		}
		this.longToast.toast()
	}),
	member: co.wrap(function* () {
		var authToken = storage.get('authToken')
		var unionId = storage.get('unionId')

		if (authToken) {
			var res = yield graphql.isMember()
			this.setData({
				isMember: res.user && res.user.isMember || false,
				memberExpiresAt:  res.user.selectedPrinter ? res.user.selectedPrinter.memberExpiresAt : null
			})
		}
		if (!authToken && unionId) {
			if (app.openId) {
				try {
					const resp = yield request({
						url: app.apiServer + `/ec/v2/users/user_id`,
						method: 'GET',
						dataType: 'json',
						data: {
							openid: app.openId
						}
					})
					if (resp.data.code != 0) {
						throw (resp.data)
          }
          storage.set('authToken', resp.data.auth_token)
					let res = yield graphql.isMember()
					this.setData({
						isMember: res.user && res.user.isMember || false,
						memberExpiresAt: res.user.selectedPrinter.memberExpiresAt
					})
				} catch (e) {
					util.showErr(e)
				}
			} else {
				setTimeout(function () {
					loopCount++
					if (loopCount <= 100) {
						_this.member()
					} else {
            logger.info('loop too long, stop')
					}
				}, 2000)
			}
		}
	}),

	onShow: function () {
		let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
		this.hasAuthPhoneNum = hasAuthPhoneNum
		this.setData({
			hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
		})
		let unionId = storage.get('unionId')
		if (!unionId) {
			let url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
			return router.navigateTo(url, {
        url: url,
        share_user_id: this.share_user_id,
        way: this.way
      })
		}

    this.setData({
      userAuthorize: unionId ? true : false
    })
	
  },
  
	linktoauthorize: function () {
		let url = this.share_user_id ? `/pages/authorize/index` : `/pages/authorize/index`
    router.navigateTo(url, {
      url: url,
      share_user_id: this.share_user_id,
      way: this.way
    })
	},

	onShareAppMessage: co.wrap(function* (res) {
		res = res[0]
		if (res.from === 'button') {
			this.longToast.toast({
				type: 'loading',
				title: '请稍候'
			})
			try {
				const resp = yield api.shareResource(app.openId)
				if (resp.code != 0) {
					throw (resp)
				}
				this.longToast.hide()
			} catch (e) {
        this.longToast.hide()
				util.showErr(e)
			}

			return {
				title: this.title,
				path: `/pages/print_doc/library_play_preview/library_play_preview?id=${this.id}&sn=${this.sn}&user_id=${this.user_id}&title=${this.title}&type_id=${this.type_id}&as_type=${this.data.as_type}&type=${this.data.type}`
			}
		} else {
			return app.share
		}

	}),
	getDevice: co.wrap(function* () {
		try {
			const resp = yield request({
				url: app.apiServer + `/boxapi/v2/printers`,
				method: 'GET',
				dataType: 'json',
				data: {
					'openid': app.openId
				}
			})
      logger.info('查询绑定的**打印机列表', resp)
			if (resp.data.code != 0) {
				throw (resp.data)
			}
			if (resp.data.res.selected_printer) {
        app.activeDevice = resp.data.res.selected_printer
        logger.info('已绑打印机', resp.data, app.activeDevice)
				if (app.activeDevice.is_3115) {
					this.setData({
						is_3115: true
					})
				}
			}

		} catch (e) {
			this.longToast.hide()
      logger.info('===执行到这里异常===')
			util.showErr(e)
		}
	}),
	tab_slide: function (e) {
    logger.info(e.detail.current)
		this.setData({
			num: e.detail.current
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
	loopGetOpenId: co.wrap(function* () {
		let loopCount = 0
		let _this = this
		if (app.openId) {
      logger.info('openId++++++++++++----', app.openId)
			this.longToast.toast({
				type: 'loading',
				title: '请稍候'
			})
			yield this.getUserId()
			yield this.member()
			if (!app.activeDevice) {
				yield this.getDevice()
      }
      logger.info(this.data.type)
			if (this.data.type == '_learning') {
				yield this.getShijuanDetail()
			} else {
				yield this.getDetail()
			}
			if (app.activeDevice) {
				yield this.getCapability()
			}

			return
		} else {
			setTimeout(function () {
				loopCount++
				if (loopCount <= 100) {
          logger.info('openId not found loop getting...')
					_this.loopGetOpenId()
				} else {
          logger.info('loop too long, stop')
				}
			}, 2000)
		}
	}),
	getUserId: co.wrap(function* () {
		try {
			const resp = yield request({
				url: app.apiServer + `/ec/v2/users/user_id`,
				method: 'GET',
				dataType: 'json',
				data: {
					openid: app.openId
				}
			})
			if (resp.data.code != 0) {
				throw (resp.data)
      }
      logger.info('获取user_id', resp.data)
			this.user_id = resp.data.user_id
		} catch (e) {
			util.showErr(e)
		}
	}),

	getUnion: co.wrap(function* () {
		try {
			var unionId = storage.get('unionId')
			this.setData({
				unionId
      })
      logger.info('get unionId', unionId)
		} catch (e) {
			util.showErr({message: '请重新打开小程序'})
		}
	}),

	toMember: function () {
    router.navigateTo('/pages/')
		// wx.navigateTo({
		// 	url: `/pages/error_book/pages/account/member?isAndroid=${this.data.isAndroid}&isMember=false`
		// })
	},

	getDetail: co.wrap(function* () {
		this.longToast.toast({
			type: 'loading',
			title: '请稍候'
		})
		try {
			const resp = yield graphql.getContentDetail(this.sn, this.id)
      this.longToast.hide()
      logger.info('===内容单条详情===', resp)
      
			resp.resource.preview_urls = JSON.parse(resp.resource.preview_urls)

			this.setData({
				detail: resp.resource,
				is_doc: resp.resource.is_doc,
				media_type: resp.resource.media_type,
				discountType: resp.resource.discount.discountType,
				discount: resp.resource.discount,
				collection: resp.resource && resp.resource.is_collected || false,
				endPrintPage: resp.resource.preview_urls.length
			})

		} catch (e) {
      logger.info(e)
			this.longToast.hide()
			util.showGraphqlErr(e)
		}
	}),
	getShijuanDetail: co.wrap(function* () {
		this.longToast.toast({
			type: 'loading',
			title: '请稍候'
		})

		var params = {
			openid: app.openId,
			resource_sign: this.id,
			sn: this.sn
    }
    logger.info('==试卷请求参数==', params)
		try {
			const resp = yield request({
				url: app.apiServer + `/boxapi/v2/resources/${this.id}`,
				method: 'GET',
				dataType: 'json',
				data: params
			})
			if (resp.data.code != 0) {
				throw (resp.data)
      }
      logger.info('==试卷单条详情==', resp.data.res)

			this.longToast.hide()
			this.setData({
				detail: resp.data.res,
				is_doc: resp.data.res.is_doc,
				media_type: resp.data.res.media_type
			})
		} catch (e) {
			this.longToast.hide()
			util.showErr(e)
		}
  }),
  
	collect: co.wrap(function* () {
		var unionId = storage.get('unionId')
		if (!unionId) {
			var url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
	
      return router.navigateTo('', {
        url: url,
        share_user_id: this.share_user_id,
        way: this.way
      })
		}
		this.longToast.toast({
			img: '../../images/loading.gif',
			title: '请稍候',
			duration: 0
		})
		let params = {
			sn: this.id,
			type: 'ec_content',
			openid: app.openId
		}
		let resp
		try {
			if (this.data.collection) {
				resp = yield api.deleteCollections(params)
			} else {
				resp = yield api.createCollections(params)
			}
			if (resp.code != 0) {
				throw (resp)
			}
			console.log('收藏', resp)
			this.longToast.toast()
			this.setData({
				collection: !this.data.collection
			})
		} catch (e) {
			this.longToast.toast()
			util.showErr(e)
		}
  }),
  
	toConfirm: co.wrap(function* (e) {
		var unionId = storage.get('unionId')
		if (!unionId) {
			var url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
	
      return router.navigateTo(url, {
        url: url,
        share_user_id: this.share_user_id,
        way: this.way,
      })
		}
		this.setData({
			showSetting: true
		})
	}),

	printPreview: function () {
    router.navigateTo('/pages/webview/index', {
      url: encodeURIComponent(this.data.detail.webview_url),
      title: this.title
    })
  },
  
	toPay: co.wrap(function* () {
		var unionId = storage.get('unionId')
		if (!unionId) {

			var url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
      return router.navigateTo(url, {
        url: url,
        share_user_id: this.share_user_id,
        way: this.way,
      })
		}
		if (!app.activeDevice) {
			return util.showErr({
        message: '您还未绑定打印机，快去绑定吧'
      })
		}
		var brand
		this.longToast.toast({
			type: 'loading',
			title: '请稍候'
		})
		var params = {
			sn: this.sn,
			resource_sign: this.id,
			openid: app.openId,
			title: this.title
		}

    try {
			const resp = yield request({
				url: app.apiServer + `/boxapi/v2/resources/prepay`,
				header: {
					'G-Auth': app.gAuthAppKey
				},
				method: 'POST',
				dataType: 'json',
				data: params
			})
			if (resp.data.code == 0) {
				if (!resp.data.res.free_to_print) {
					brand = resp.data.res
				}
			} else {
				this.longToast.hide()
				const res = yield showModal({
					title: '提示',
					content: resp.data.message,
					showCancel: false,
					confirmColor: '#fae100',
				})
				if (res.confirm) {
          router.navigateBack()
				}
			}
		} catch (e) {
			this.longToast.hide()
			yield showModal({
				title: '网络异常',
				content: '请检查您的手机网络后重试',
				showCancel: false,
				confirmColor: '#fae100'
			})
			return
		}
		this.longToast.hide()
		if (this.data.detail.can_free_print && brand) {
			this.setData({
				'detail.can_free_print': false
			})
			yield showModal({
				title: '温馨提示',
				content: '该设备今日免费打印次数已用完',
				confirmColor: '#2086ee',
				confirmText: "确认",
				showCancel: false
			})
		}

		if (brand) {
			yield requestPayment({
				timeStamp: brand.timeStamp,
				nonceStr: brand.nonceStr,
				package: brand.package,
				signType: brand.signType,
				paySign: brand.paySign
			})
		}
		this.setData({
			'detail.is_valid': true
		})
		this.toConfirm()
  }),
  
	toPayContent: function () {
		if (!(this.data.isAndroid || (!this.data.isAndroid && this.data.discountType == 'free' && this.data.isMember))) {
			return this.setData({
				showIosTip: true
			})
		}
		var params = {
			isColorPrinter: this.data.isColorPrinter,
			isDuplex: this.data.isDuplex,
			id: this.id,
			sn: this.sn,
			title: this.title,
			isMember: this.data.isMember,
			type: this.data.type,
			memberExpiresAt:this.data.memberExpiresAt
    }
    router.navigateTo('/pages/print_doc/content_pay/content_pay', {
      params: JSON.stringify(params)
    })
	
	},

	closeIosTip () {
		this.setData({
			showIosTip: false
		})
  },
  
	print: co.wrap(function* (e) {
		try {
			if (!app.activeDevice) {
				return util.showErr({message: '您还未绑定打印机，快去绑定吧'})
			}
			this.longToast.toast({
				type: 'loading',
				title: '请稍候'
			})

			var that = this
			var resourceable = {
        type: 'ec_content',
        sn: that.id,
        category_sn: that,sn
      }

			var setting = {}
			setting.duplex = that.data.duplexcheck
			setting.color = that.data.colorcheck
			setting.number = that.data.documentPrintNum
			if (that.data.type != '_learning') {
				setting.start_page = that.data.startPrintPage
				setting.end_page = that.data.endPrintPage
			}

			var params = {
				openid: app.openId,
				media_type: this.data.media_type,
				resourceable,
				setting: setting,
			}
			if (that.data.type != '_learning') {
				params.is_vip = true
			}

      var resp = yield request({
				url: app.apiServer + `/boxapi/v2/orders`,
				method: 'POST',
				dataType: 'json',
				data: params
      })
      
			if (resp.data.code == 0) {
        this.longToast.hide()
        router.navigateTo('/pages/finish/index', {
          media_type: this.data.media_type,
          state: resp.data.order.state,
          type: this.data.type
        })
			} else if (resp.data.code == 1) {
				this.longToast.hide()
				const res = yield showModal({
					title: '提示',
					content: resp.data.message,
					showCancel: false,
					confirmColor: '#fae100',
				})
				if (res.confirm) {
          router.navigateBack()
				}
			} else {
				throw (resp.data)
			}

		} catch (e) {
			this.longToast.hide()
			util.showErr(e)
		}
	}),

	backToHome: function () {
		var unionId = storage.get('unionId')
		if (!unionId) {
			let url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
			return router.switchTab(url,  this.share_user_id ? {
        url: url,
        share_user_id: this.share_user_id,
        way: this.way
      } : '')
    }
    router.switchTab('/pages/index/index')
		
	},

	//获取打印能力
	getCapability: co.wrap(function* () {
		this.longToast.toast({
			type: 'loading',
			title: '请稍候'
		})
		try {
			const resp = yield request({
				url: app.apiServer + `/ec/v2/apps/printer_capability`,
				method: 'GET',
				dataType: 'json',
				data: {
					openid: app.openId,
					printer_id: app.activeDevice.id,
					printer_type: app.activeDevice.printer_type
				}
			})
			if (resp.data.code != 0) {
				throw (resp.data)
      }
      logger.info('获取打印能力成功', resp.data)

      this.longToast.hide()
			this.setData({
				isColorPrinter: resp.data.print_capability.color_modes.length == 2 ? true : false,
				isDuplex: resp.data.print_capability.media_sizes[0].duplex ? true : false
			})
		} catch (e) {
			this.longToast.hide()
			util.showErr(e)
		}
	}),

	//减少份数
	cutPrintNum () {
		if (this.data.documentPrintNum <= 1) {
			return
		}
		this.data.documentPrintNum -=1
		this.setData({
			documentPrintNum: this.data.documentPrintNum
		})
	},

	//增加份数
	addPrintNum: co.wrap(function* () {
    logger.info(this.data.documentPrintNum)
		this.data.documentPrintNum += 1
		if (this.data.documentPrintNum <= 30) {
			this.setData({
				documentPrintNum: this.data.documentPrintNum
			})
		} else {
			this.setData({
				documentPrintNum: 30
			})
			return wx.showModal({
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
    logger.info('起始页===', parseInt(e.detail.value), typeof (e.detail.value))
		if (parseInt(e.detail.value) > parseInt(this.data.endPrintPage) || parseInt(e.detail.value) <= 0) {
			this.setData({
				startPrintPage: 1
			})
			wx.showModal({
				content: '请输入正确的起始页',
				confirmColor: '#2086ee',
				confirmText: "确认",
				showCancel: false    
			})
			return
		} else {
      logger.info('==打印起始页===', e.detail.value)
			this.data.startPrintPage = e.detail.value
		}
	},
	//输入打印结束页
	inputEndPage(e) {
		this.data.endPrintPage = e.detail.value
	},
	endPageJudge(e) {
		if (parseInt(e.detail.value) < parseInt(this.data.startPrintPage) || parseInt(e.detail.value) > this.data.detail.preview_urls.length) {
			console.log('结束页===', parseInt(e.detail.value), typeof (e.detail.value))
			this.setData({
				endPrintPage: this.data.detail.preview_urls.length,
			})
			wx.showModal({
				content: '请输入正确的结束页',
				confirmColor: '#2086ee',
				confirmText: "确认",
				showCancel: false
			})
			return
		} else {
			console.log('打印完成页===', e.detail.value)
			this.data.endPrintPage = e.detail.value
		}
	},

	//选择颜色
	colorCheck(e) {
		this.setData({
			colorcheck: e.currentTarget.dataset.style
		})
	},

	//选择单双面打印模式
	duplexCheck({currentTarget: {dataset: {style}}}) {
		this.setData({
			duplexcheck:  style == 0 ? false : true
		})
	},

	//确认按钮提交
	confcheck() {
		if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
			return
		}
		if (this.data.type != '_learning') {
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
		}

		let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
		if (hideConfirmPrintBox) {
			this.print()
		} else {
			this.setData({
				['confirmModal.isShow']: true
			})
		}
	},
	getPhoneNumber: co.wrap(function* (e) {
		yield app.getPhoneNum(e)
		wx.setStorageSync("hasAuthPhoneNum", true)
		this.hasAuthPhoneNum = true
		this.setData({
			hasAuthPhoneNum: true
		})
		this.confcheck()
	}),

	cancelcheck() {
		this.setData({
			showSetting: false
		})
	},
	loopGrowingOpenId: co.wrap(function* (unionId) {
		let loopCount = 0
		let _this = this
		if (app.openId) {
			console.log('loopGrowingOpenId openId++++++++++++----', app.openId, unionId)
			// console.log(app.gio)
			app.gio('identify', app.openId, unionId)
			console.log('11111111111111122222222')
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
	onUnload: function () {
		event.remove('Authorize', this)
	}
})