const app = getApp()
import {
	regeneratorRuntime,
	co,
	util,
	wxNav,
	storage
} from '../../../utils/common_import.js'
import commonRequest from '../../../utils/common_request'
import memberGql from '../../../network/graphql/member'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
const event = require('../../../lib/event/event')

Page({
	data: {
		kidInfo: null,
		memberTipUrl: '',
		checked: false,
		expiration: '',
		price: ''
	},

	onLoad: co.wrap(function* (query) {
		this.longToast = new app.weToast()
		this.paymentOrderSn = query.payment_order_sn
		this.getMemberPaymentOrder()
		let stage = storage.get("kidStage")
		this.setData({
			stage: stage,
			memberTipUrl: stage.rootKey === 'preschool' ? '../images/member_order_preschool_tip.png' : '../images/member_order_subject_tip.png',
		})
	}),

	getMemberPaymentOrder: co.wrap(function* () {
		this.longToast.toast({
			type: 'loading'
		})
		try {
			let resp = yield memberGql.getMemberPaymentOrder(this.paymentOrderSn),
			tempData = resp.currentUser.paymentOrders[0].payable
			this.longToast.toast()
			this.setData({
				kidInfo: resp.currentUser.selectedKid,
				expiration: tempData.afterRechargeDate,
				price: tempData.priceY.toFixed(2)
			})
		} catch (e) {
			this.longToast.toast()
			util.showError(e)
		}
	}),

	checkProtocol() {
		this.setData({
			checked: !this.data.checked
		})
	},

	toProtocol() {

	},

	openeMemebership(e) {
		if (app.preventMoreTap(e)) return
		if (this.data.checked) {
			this.longToast.toast({
				type: 'loading'
			})
			commonRequest.createPayment(this.paymentOrderSn, () => {
				this.longToast.hide()
				wx.showToast({
					icon: 'none',
					title: '会员开通成功',
					mask: true
				})
				setTimeout(() => {
					wxNav.switchTab('/pages/account/index')
				}, 1500)
			}, (e) => {
				this.longToast.hide()
				if(e.errMsg.indexOf('cancel')<0){
					util.showError(e)
				}
			})
		} else {
			wx.showToast({
				title: '请先同意服务协议',
				icon: 'none'
			})
		}
	},
})