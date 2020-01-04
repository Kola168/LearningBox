const app = getApp()
import {
	regeneratorRuntime,
	co,
	util,
} from '../../../utils/common_import.js'
import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import storage from '../../../utils/storage'
const event = require('../../../lib/event/event')

Page({
	data: {
		kidInfo: null,
		memberTipUrl: '',
		checked:false,
		expiration:'',
		price:''
	},

	onLoad: co.wrap(function* (options) {
		this.longToast = new app.weToast()
		this.options = options
	
		yield this.getUserInfo()
		let stage = storage.get("kidStage")
		this.setData({
			stage:stage,
			memberTipUrl: stage === 'preschool'?'../images/member_order_preschool_tip.png':'../images/member_order_subject_tip.png',
		})
	}),

	getUserInfo: co.wrap(function*() {
		this.longToast.toast({
			type: 'loading'
	})
    try {
			let resp = yield gql.getUser()
			this.longToast.toast()
      this.setData({
        kidInfo: resp.currentUser.selectedKid,
      })	
    } catch (e) {
			this.longToast.toast()
      util.showError(e)
    }
	}),

	agree: co.wrap(function*() {
		this.setData({
			checked:!this.data.checked
		})
	}),

	openeMemebership: co.wrap(function*() {
		
	}),

})