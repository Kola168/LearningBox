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
		users: null,
		kidInfo: null,
		shareGroupSn: '',
		memberTipUrl: '../images/member_order_preschool_tip.png',
		checked:false
	},

	onLoad: co.wrap(function* (options) {
		this.longToast = new app.weToast()
		this.options = options
		this.userSn = storage.get('userSn')
		if (!this.userSn) {
			return router.navigateTo('/pages/authorize/index')
		}
		// yield this.getFamilyUser()
		// if (this.options.shareGroupSn) {
		// 	this.setData({
		// 		shareGroupSn: this.options.shareGroupSn
		// 	})
		// }
		// logger.info(this.data.shareGroupSn)
		// event.on('Authorize', this, () => {
		// 	this.userSn = storage.get('userSn')
		// 	this.getFamilyUser()
		// 	if (this.options.shareGroupSn) {
		// 		this.setData({
		// 			shareGroupSn: this.options.shareGroupSn
		// 		})
		// 	}
		// })
	}),
})