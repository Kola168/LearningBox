const app = getApp()
import wxNav from '../../utils/nav.js'
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import co from '../../lib/co/co'
import regeneratorRuntime from '../../lib/co/runtime'
const util = require('../../utils/util')
// page mixins
require('../../utils/mixin.js')
import index from "../../mixins/index.js"
import init from "../../mixins/init.js"
import storage from '../../utils/storage.js'
import api from '../../network/restful_request.js'
// const request = util.promisify(wx.request)
const checkSession = util.promisify(wx.checkSession)

Page({
  mixins: [index, init],
  data: {
    userInfo: {},
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
    }, ],
    showAuth: false, //登录
    homeType: 'subject'
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
  onShow: co.wrap(function* () {
    yield this.getUnion() //授权
  }),
  getUnion: co.wrap(function* () {
    try {
      let authToken = storage.get('authToken')
      if (authToken) {
        this.setData({
          showAuth: false
        })
        app.authToken = authToken
      }
      if (!authToken) {
        this.setData({
          showAuth: true,
        })
      }
    } catch (e) {
      util.showError({
        message: '请重新打开小程序'
      })
    }
  }),
  checkSession: co.wrap(function* () {
    try {
      yield checkSession()
      return true
    } catch (e) {
      return false
    }
  }),
  userInfoHandler: co.wrap(function* (e) {
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
        throw (resp.data)
      }
      storage.put('authToken', resp.res.auth_token)
      storage.put('unionId', resp.res.unionid)

      // if (resp.data.res.phone) {
      //   app.hasPhoneNum = true
      //   app.globalPhoneNum = resp.data.res.phone
      //   wx.setStorageSync("phonenum", resp.data.res.phone)
      // }
      app.authToken = resp.res.auth_token
      this.setData({
        showAuth: false
      })
      this.longToast.hide()
    } catch (e) {
      yield app.login()
      this.setData({
        showAuth: true
      })
      this.longToast.hide()
      util.showError(e)
    }
  }),
  toNomalPrint: function (e) {
    let url
    switch (e.currentTarget.id) {
      case 'photo':
        url = "/pages/print_photo/mediachoose"
        break
      case 'doc':
        url = "/pages/print_doc/index/index"
				break
			case 'more':
				url = "/pages/print_funny/index"
				break
      defalt:
          url = ''
    }
    wx.navigateTo({
      url
    })
  }
})