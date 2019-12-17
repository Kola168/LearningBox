// pages/library/play_preview.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
import api from '../../../../network/restful_request'
import graphql from '../../../../network/graphql_request'

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
import commonRequest from '../../../../utils/common_request.js'
const event = require('../../../../lib/event/event')
import storage from '../../../../utils/storage'
import router from '../../../../utils/nav'
Page({
	data: {
		recordDetails: {},
		collection: false,
		num: 0,
		circular: true,
		showGetModal: false, //耗材推荐弹窗
		supply_types: '',
		from: '',
		showSetting: false, //显示打印设置
		documentPrintNum: 1, //打印份数
		startPrintPage: 1,
		endPrintPage: 1,
		colorCheck: 'Color', //默认彩色
		duplexCheck: false,
		isColorPrinter: true,
		isDuplex: true,
		unionId: '',
		userAuthorize: false,
		hasAuthPhoneNum: false,
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
	},
	onLoad: co.wrap(function* (options) {
		var systemInfo = wx.getSystemInfoSync()
		this.longToast = new app.weToast()
		this.setData({
			title: decodeURIComponent(options.title),
			type: options.type ? options.type : '',
			as_type: options.as_type ? options.as_type : 'common'
		})
		this.setData({
			isAndroid: systemInfo.system.indexOf('iOS') > -1 ? false : true
		})
		this.id = options.id //试卷/内容单个id
		this.sn = options.sn //分类sn
		this.title = decodeURIComponent(options.title)
		this.share_user_id = options.user_id
		this.type_id = options.type_id //父级id


		// this.way = 1 //默认自然用户
		// if (this.share_user_id) {
		// 	this.way = 5
		// }
	
		wx.setNavigationBarTitle({
			title: this.title
		})
		this.longToast = new app.weToast()
		let unionId = storage.get('unionId')
		if (unionId) {
      yield this.getRecordSource()
		}

		//授权成功后回调
		event.on('Authorize', this, function (data) {
			this.getRecordSource()
		})

	}),	
	getRecordSource: co.wrap(function*(){
		this.longToast.toast({
      type: 'loading',
      title: '请稍候'
		})
		
		try {
			var resp = yield graphql.getRecordSource(this.sn)

			this.setData({
				content: resp.content
			})
			this.longToast.hide()
		} catch(err) {
			this.longToast.hide()
			util.showError(err)
		}
	}),

	// updateDetail: co.wrap(function* () {
	// 	this.longToast.toast({
	// 		type: 'loading',
	// 		title: '请稍候'
	// 	})

    

	// 	// if (app.activeDevice) {
	// 	// 	yield this.getCapability()
	// 	// }
	// 	this.longToast.toast()
  // }),

	onShow: co.wrap(function*() {
		let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
		this.hasAuthPhoneNum = hasAuthPhoneNum
		this.setData({
			hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
    
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
  
	// loopGetOpenId: co.wrap(function* () {
	// 	let loopCount = 0
	// 	let _this = this
	// 	if (app.openId) {
	// 		console.log('openId++++++++++++----', app.openId)
	// 		this.longToast.toast({
	// 			img: '../../images/loading.gif',
	// 			title: '请稍候',
	// 			duration: 0
	// 		})
	// 		yield this.getUserId()
		
	// 		console.log(this.data.type)
  //     yield this.getDetail()

	// 		if (app.activeDevice) {
	// 			yield this.getCapability()
	// 		}

	// 		return
	// 	} else {
	// 		setTimeout(function () {
	// 			loopCount++
	// 			if (loopCount <= 100) {
	// 				console.log('openId not found loop getting...')
	// 				_this.loopGetOpenId()
	// 			} else {
	// 				console.log('loop too long, stop')
	// 			}
	// 		}, 2000)
	// 	}
  // }),

	// getDetail: co.wrap(function* () {
	// 	this.longToast.toast({
	// 		type: 'loading',
	// 		title: '请稍候'
	// 	})
	// 	try {
	// 		const resp = yield graphql.getContentDetail(this.sn, this.id)
	// 		resp.resource.preview_urls = JSON.parse(resp.resource.preview_urls)

	// 		this.setData({
	// 			detail: resp.resource,
	// 			media_type: resp.resource.media_type,
	// 			discountType: resp.resource.discount.discountType,
	// 			discount: resp.resource.discount,
	// 			collection: resp.resource && resp.resource.is_collected || false,
	// 			endPrintPage: resp.resource.preview_urls.length
	// 		})

	// 		this.longToast.toast()
	// 	} catch (e) {
	// 		this.longToast.toast()
	// 		util.showError(e)
	// 	}
  // }),

	collect: co.wrap(function* () {
    var auth = yield this.authCheck()
    if (!auth) {
      return
    }
    
		this.longToast.toast({
			type: 'loading',
			title: '请稍候',
		})
		var params = {
			sn: this.id,
			type: 'ec_content'
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
			this.longToast.hide()
			this.setData({
				collection: !this.data.collection
			})
		} catch (e) {
			this.longToast.hide()
			util.showError(e)
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
    var unionId = storage.get('unionId')
		if (!unionId) {
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
			if (!app.activeDevice) {
				return util.showError({
          message: '您还未绑定打印机，快去绑定吧'
        })
      }
      
			this.longToast.toast({
				type: 'loading',
				title: '请稍候'
			})

			let _this = this
			let setting = {}
			setting.duplex = _this.data.duplexCheck
			setting.grayscale = _this.data.colorCheck == 'Color' ? false : true
			setting.copies = _this.data.documentPrintNum
      setting.startPage = _this.data.startPrintPage
      setting.endPage = _this.data.endPrintPage

	
      // const resp = yield commonRequest.createOrder({
      //   media_type: this.data.media_type,
			// 	resourceable: {
      //     type: 'ec_content',
      //     sn: _this.id,
      //     category_sn: _this.sn
      //   },
			// 	setting: setting,
      // })
	
			if (resp.code == 0) {
				this.longToast.hide()
        router.redirectTo('/pages/finish/index', {
          media_type: this.data.media_type,
          state: resp.order.state,
          type: this.data.typ
        })
			} else if (resp.code == 1) {
				this.longToast.hide()
				const res = yield showModal({
					title: '提示',
					content: resp.message,
					showCancel: false,
					confirmColor: '#fae100',
				})
				if (res.confirm) {
          router.navigateBack()
				}
			} else {
				throw (resp)
			}

		} catch (e) {
			this.longToast.hide()
			util.showError(e)
		}
	}),

	toEditAvatar: function() {
		router.navigateTo('pages/package_common/account/name_edit')
	},

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
				endPrintPage: this.data.detail.preview_urls.length,
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
		if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
			return
		}
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
  
	getPhoneNumber: co.wrap(function* (e) {
    yield app.getPhoneNum(e)
    storage.put('hasAuthPhoneNum', true)
		this.hasAuthPhoneNum = true
		this.setData({
			hasAuthPhoneNum: true
		})
		this.confCheck()
	}),

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
			// try {
			// 	const resp = yield api.shareResource(app.openId)
			// 	if (resp.code != 0) {
			// 		throw (resp)
			// 	}
			// 	this.longToast.toast()
			// } catch (e) {
			// 	util.hideToast(this.longToast)
			// 	util.showErr(e)
			// }

			return {
				title: this.title,
				path: `/pages/library/play_preview?id=${this.id}&sn=${this.sn}&user_id=${this.user_id}&title=${this.title}&type_id=${this.type_id}&as_type=${this.data.as_type}&type=${this.data.type}`
			}
		} else {
			return app.share
		}

  }),
  
	onUnload: function () {
		event.remove('Authorize', this)
	}
})