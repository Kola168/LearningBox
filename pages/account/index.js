const app = getApp()
import gql from '../../network/graphql_request.js'
import {
	regeneratorRuntime,
	co,
	util,
	wxNav
} from '../../utils/common_import.js'
import storage from '../../utils/storage'
const event = require('../../lib/event/event')
import {
	features
} from 'config'

Page({
	data: {
		kidInfo: null,
		activeDevice: null,
		features,
		isSubjectMember: false,
		isPreschoolMember: false,
		currentUserIsCreator: false
	},

	onLoad: function (options) {
		this.longToast = new app.weToast()
		event.on('Authorize', this, () => {
			this.userSn = storage.get('userSn')
			this.getUserInfo()
		})
	},
	onShow: co.wrap(function* () {
		let userSn = storage.get('userSn')
		this.userSn = userSn
		// let isAuth = yield this.authCheck()
		// if (isAuth) {
		//   yield this.getUserInfo()
		// }
		if (this.userSn) {
			yield this.getUserInfo()
		}
	}),

	authCheck: co.wrap(function* () {
		if (!this.userSn) {
			wxNav.navigateTo('/pages/authorize/index')
			return false
		} else {
			return true
		}
	}),

	getUserInfo: co.wrap(function* () {
		this.longToast.toast({
			type: "loading",
			duration: 0
		})
		try {
			let resp = yield gql.getUser()
			console.log(resp)
			this.setData({
				kidInfo: resp.currentUser.selectedKid,
				activeDevice: resp.currentUser.selectedDevice,
				isSubjectMember: resp.currentUser.isSchoolAgeMember,
				isPreschoolMember: resp.currentUser.isPreschoolMember,
				currentUserIsCreator: resp.currentUser.currentGroup.currentUserIsCreator,
			  rootKey:((resp.currentUser.selectedKid.stageRoot.rootKey == 'preschool') ? 'preschool' : 'subject')
			})
			this.longToast.hide()
		} catch (e) {
			this.longToast.hide()
			util.showError(e)
		}
	}),

	toNext(e) {
		let userSn = storage.get('userSn')
		this.userSn = userSn
		if (!this.userSn) {
			return wxNav.navigateTo('/pages/authorize/index')
		}
		let pageKey = e.currentTarget.id,
			url = ''
		switch (pageKey) {
			case 'deviceList':
				url = '/pages/package_device/list/index'
				break;
			case 'addDevice':
				url = '/pages/package_device/network/index/index'
				break;
			case 'setInfo':
				url = '/pages/package_common/account/personal_info'
				break;
		}
		wxNav.navigateTo(url, {})
	},

	onlineGuest: co.wrap(function* () {
		let isAuth = yield this.checkIsScope()
		if (isAuth) {
			let url = 'https://gfd178.udesk.cn/im_client/?web_plugin_id=63138'
			wx.navigateTo({
				url: `/pages/webview/index?url=${encodeURIComponent(url)}`
			})
		}
	}),

	clickFeature: co.wrap(function* (e) {
		console.log(e)
		let userSn = storage.get('userSn')
		this.userSn = userSn
		if (!this.userSn) {
			return wxNav.navigateTo('/pages/authorize/index')
		}
		if (e.currentTarget.id != '') {
			if(e.currentTarget.dataset.key=='paperLeraning'){
				wxNav.navigateTo(e.currentTarget.id, {
					type:this.data.rootKey
				})
			}else{
				wxNav.navigateTo(e.currentTarget.id)
			}
		} else {
			wx.showToast({
				title: '暂未开放，敬请期待',
				icon: 'none',
				duration: 2000
			})
		}

	}),

	onUnload() {
		event.remove('Authorize', this)
	},

	member() {
		// wx.showToast({
		// 	title: '暂未开放，敬请期待',
		// 	icon: 'none',
		// 	duration: 2000
		// })
		wxNav.navigateTo('/pages/package_member/member/index')
	},

	toRules: function () {
		wx.downloadFile({
			url: 'https://cdn-h.gongfudou.com/LearningBox/main/privacy_agreement.pdf',
			success: function (res) {
				const filePath = res.tempFilePath
				wx.openDocument({
					filePath: filePath,
					success: function (res) {
					}
				})
			}
		})
	},
})