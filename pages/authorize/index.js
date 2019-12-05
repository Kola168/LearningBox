// pages/authorize/index.js
"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const checkSession = util.promisify(wx.checkSession)

import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import api from '../../network/restful_request.js'
import storage from '../../utils/storage.js'


Page({
	data: {
	},

	onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
	}),

	onShow: co.wrap(function* () { }),

	authorize: co.wrap(function* (e) {
		this.detail = e.detail
		logger.info('detail======', this.detail)

		if (!e.detail.userInfo || !e.detail.encryptedData) {
			return
		}
		yield this.loopGetOpenId()
	}),

	loopGetOpenId: co.wrap(function* () {
		let loopCount = 0
		let _this = this
		if (app.openId) {
			logger.info('openId++++++++++++----', app.openId)
			yield _this.decrypt()
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
	
	checkSession: co.wrap(function* () {
		try {
			yield checkSession()
			return true
		} catch (e) {
			console.log('need login', e)
			return false
		}
	}),
	
	decrypt: co.wrap(function* () {
		console.log('here======')
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
          encrypted_data: encodeURIComponent(this.detail.encryptedData),
          iv: encodeURIComponent(this.detail.iv),
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
			logger.info('通用接口授权解密成功=====',resp)
      storage.put('authToken', resp.res.auth_token)
      storage.put('unionId', resp.res.unionid)

      // if (resp.data.res.phone) {
      //   app.hasPhoneNum = true
      //   app.globalPhoneNum = resp.data.res.phone
      //   wx.setStorageSync("phonenum", resp.data.res.phone)
      // }
      app.authToken = resp.res.auth_token
      
      this.longToast.toast()
    } catch (e) {
      yield app.login()
      this.longToast.toast()
      util.showErr(e)
    }
	}),

	backTo: function () {
		wx.navigateBack()
	}

})