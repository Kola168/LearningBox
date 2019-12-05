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
    }, ],
    showAuth: false //登录

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
      let unionId = storage.get('unionId')
      let openId = storage.get('openId')
      if (unionId && openId) {
        this.setData({
          showAuth: false
        })
        app.openId = openId
      }
      if (!unionId) {
        this.setData({
          showAuth: true,
        })
      }
    } catch (e) {
      util.showErr({
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
      const resp = yield request({
        url: app.apiServer + `/api/v1/users/sessions/wechat_decryption`,
        method: 'POST',
        dataType: 'json',
        data: params
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      storage.put('authToken', resp.data.res.auth_token)
      storage.put('unionId', resp.data.res.unionid)

      // if (resp.data.res.phone) {
      //   app.hasPhoneNum = true
      //   app.globalPhoneNum = resp.data.res.phone
      //   wx.setStorageSync("phonenum", resp.data.res.phone)
      // }

      this.setData({
        showAuth: false
      })
      this.longToast.toast()
    } catch (e) {
      yield app.login()
      this.setData({
        showAuth: true
      })
      this.longToast.toast()
      util.showErr(e)
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
        defalt:
          url = ''
    }
    wx.navigateTo({
      url
    })
  }
})