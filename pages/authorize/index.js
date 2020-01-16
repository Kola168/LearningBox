
// pages/authorize/index.js
"use strict"
const app = getApp()
const checkSession = util.promisify(wx.checkSession)

import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/authorize/index')
import api from '../../network/restful_request.js'
import gql from '../../network/graphql_request.js'

import { regeneratorRuntime, co, wxNav, util, storage } from '../../utils/common_import'

var event = require('../../lib/event/event.js')

Page({
	data: {
	},

	onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
	}),

	onShow: co.wrap(function* () { }),

	checkSession: co.wrap(function*() {
    try {
      yield checkSession()
      return true
    } catch (e) {
      return false
    }
  }),

	authorize: co.wrap(function* (e) {
		logger.info('********** userInfoHandler', e)
    if (!e.detail.userInfo || !e.detail.encryptedData) {
      return
    }
    let detail = e.detail
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    let session = yield this.checkSession()
    if (!session) {
      yield app.login()
		}

    try {
      let params = {
        openid: app.openId,
        encrypted_info: {
          encrypted_data: encodeURIComponent(detail.encryptedData),
          iv: encodeURIComponent(detail.iv),
        },
        mobile_info: {
          device_type: app.sysInfo.model,
          os_version: app.sysInfo.system,
          sdk_version: app.sysInfo.SDKVersion,
          platform: app.sysInfo.platform,
          wx_version: app.sysInfo.version,
          app_version: app.version
        },
        decr_type: 'login'
			}
			
      const resp = yield api.wechatDecryption(params)
      if (resp.code != 0) {
        throw (resp)
      }
      storage.put('authToken', resp.res.auth_token)
      storage.put('unionId', resp.res.unionid)
			storage.put('refreshToken', resp.res.refresh_token)
			storage.put("userSn", resp.res.sn)
			if(resp.res.phone){
				storage.put("phoneNum", resp.res.sn)
			}
			
      app.authToken = resp.res.auth_token
      yield this.afterUnion()
      event.emit('Authorize', 'Authorize Success')
    } catch (e) {
      yield app.login()
      this.longToast.toast()
      util.showError(e)
    }
	}),

	afterUnion:co.wrap(function*(){
    try {
      yield this.getUserInfo()
    } catch (error) {
      console.log(error)
    }
  }),

	getUserInfo: co.wrap(function*() {
    try {
			let resp = yield gql.getUser()
			this.longToast.toast()
      if (!resp.currentUser.selectedKid.stageRoot) {
        wxNav.redirectTo('/pages/index/grade')
      }else{
				wxNav.navigateBack()
			}
    } catch (e) {
			this.longToast.toast()
      util.showError(e)
    }
  }),

	backTo: function () {
		wx.navigateBack()
	}

})