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
    features
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
    let isAuth = yield this.authCheck()
    if (isAuth) {
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
        activeDevice: resp.currentUser.selectedDevice
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),
 
  toNext(e) {
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
	 wxNav.navigateTo(e.currentTarget.id)

	}),

	feedBack:co.wrap(function* () {
		wxNav.navigateTo('/pages/package_common/feedback')
	}),

  onUnload() {
    event.remove('Authorize', this)
  }
})