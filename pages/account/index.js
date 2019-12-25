/*
 * @Author: your name
 * @Date: 2019-12-12 19:34:39
 * @LastEditTime: 2019-12-17 09:46:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/pages/account/index.js
 */
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

Page({
  data: {
    kidInfo: null,
    activeDevice: null
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
      case 'records':
        url = '/pages/package_common/records/index/index'
        break;
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
  onUnload() {
    event.remove('Authorize', this)
  }
})