const app = getApp()
import wxNav from '../../utils/nav.js'
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import co from '../../lib/co/co'
import regeneratorRuntime from'../../lib/co/runtime'
const util = require('../../utils/util')
// page mixins
require('../../utils/mixin.js')
import index from "../../mixins/index.js"
import init from "../../mixins/init.js"

import storage from '../../utils/storage.js'
const request = util.promisify(wx.request)
const checkSession = util.promisify(wx.checkSession)
Page({
  mixins: [index, init],
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    blockSize: 10,
    audioType: 'circle',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    bannerUrls: [{
      url: 'http://gfd-i.memeyin.com/e-FlXfVks1do_li3DqrLWVHjr-0IPr'
    }],
    contentList: [{
      title: '家庭早教',
      url: 'http://gfd-i.memeyin.com/e-FlXfVks1do_li3DqrLWVHjr-0IPr'
    }, {
      title: '轻松带娃',
      url: 'http://gfd-i.memeyin.com/e-FlXfVks1do_li3DqrLWVHjr-0IPr'
    }, {
      title: '入园早准备',
      url: 'http://gfd-i.memeyin.com/e-FlXfVks1do_li3DqrLWVHjr-0IPr'
    }, ]

  },

  //事件处理函数
  bindViewTap: function () {
    wxNav.navigateTo('/pages/logs/logs')
  },
  onLoad: function () {
    // logger.error('123456789')
    // logger.warn('123456789')
    // logger.info('1234567890000', '6789')
    // logger.debug('123456789')
    // storage.put('hello', '123')

    this.longToast = new app.weToast()
  },
  checkSession: co.wrap(function* () {
		try {
			yield checkSession()
			return true
		} catch (e) {
			console.log('need login', e)
			return false
		}
	}),
  userInfoHandler: co.wrap(function* (e) {
    console.log('授权', e)
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

      // console.log('授权参数：', params)
  
      const resp = yield request({
        url: app.apiServer + `/api/v1/users/sessions/wechat_decryption`,
        method: 'POST',
        dataType: 'json',
        data: params
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      wx.setStorageSync('authToken', resp.data.res.auth_token)
      console.log('授权', resp.data)
      console.log('resp.data.res.union_id=========', resp.data.res.unionid)
      wx.setStorageSync('unionId', resp.data.res.unionid)
      if (resp.data.res.selected_stage.sn) {
        wx.setStorageSync('selectedStage', resp.data.res.selected_stage.sn)
        wx.setStorageSync('selectedStageName', resp.data.res.selected_stage.name)
        // wx.setStorageSync('authToken', resp.data.res.auth_token)
        let priodIdIndex
        switch (resp.data.res.selected_stage.name) {
          case '学龄前':
            priodIdIndex = 0
            break
          case '小学':
            priodIdIndex = 1
            break
          case '初高中':
            priodIdIndex = 2
            break
          default:
            priodIdIndex = 0
            break
        }
        this.setData({
          activePriodIdIndex: priodIdIndex
        })
        this.getPriodContent()

      }

      if (resp.data.res.phone) {
        app.hasPhoneNum = true
        app.globalPhoneNum = resp.data.res.phone
        wx.setStorageSync("phonenum", resp.data.res.phone)
      }

      this.setData({
        showAuth: false,
        showAuthModal: false
      })

      this.loopUploadOpenId() //上报formid
      this.userId = resp.data.res.user_id
      try {
        this.loopGrowingOpenId(resp.data.res.unionid)
      } catch (error) {}

      if (this.deviceId) {
        yield this.bindShareDevice() //绑定分享打印机
      }

      // 首页功能区
      this.getHomeFunctionList()

      yield this.getDevice()
      if (!app.activeDevice) {
        return this.longToast.toast()
      }

      this.longToast.toast()
      console.log('授权跳转111111=====', this.redirect_url)
      if (this.redirect_url) {
        // yield this.getBindOpenId()
        // this.longToast.toast()
        if (this.tag != 'index') {
          wx.navigateTo({
            url: '/' + this.redirect_url
          })
        }
      }
    } catch (e) {
      console.log(e)
      yield app.login()
      yield showModal({
        title: '授权失败',
        content: '请重新尝试',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
      this.setData({
        showAuth: true,
        showAuthModal: true
      })
      this.longToast.toast()
      util.showErr(e)
    }
  }),
})