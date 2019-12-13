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
import gql from '../../network/graphql_request.js'
import api from '../../network/restful_request.js'
import router from '../../utils/nav'
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
    homeType: '学前',
    selectedKid: null,
    stageRoot: null
  },

  //事件处理函数
  bindViewTap: function () {
    wxNav.navigateTo('/pages/logs/logs')
  },
  onLoad: co.wrap(function* () {
    this.longToast = new app.weToast()
    try {

    } catch (e) {
      console.log(e)
    }

  }),
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
        yield this.getUserInfo()
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
  getUserInfo: co.wrap(function* () {
    try {
      let resp = yield gql.getUser()
      this.setData({
        phone: resp.currentUser.phone,
        selectedKid: resp.currentUser.selectedKid,
        stageRoot: resp.currentUser.selectedKid.stageRoot
      })
      if (resp.currentUser.phone) {
        app.hasPhoneNum = true
        app.globalPhoneNum = resp.currentUser.phone
        wx.setStorageSync("phoneNum", resp.currentUser.phone)
      }
      if (!this.data.selectedKid || !this.data.selectedKid.stageRoot) {
        router.navigateTo('/pages/index/grade')
      } else {
        this.setData({
          homeType: this.data.selectedKid.stageRoot.rootName
        })
      }

    } catch (e) {
      util.showError(e)
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
        throw (resp)
      }
      storage.put('authToken', resp.res.auth_token)
			storage.put('unionId', resp.res.unionid)
			storage.put('refreshToken', resp.res.refresh_token)

      app.authToken = resp.res.auth_token
      this.setData({
        showAuth: false
      })
      yield this.getUserInfo()
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
    router.navigateTo(url)
  },
  // TODO:以下两个为测试函数，待删除
  changeSubject: function () {
    this.setData({
      homeType: this.data.homeType == 'subject' ? 'beforSchool' : 'subject'
    })
  },
  // toId: function () {
  //   router.navigateTo('/pages/print_id/index')
  // }
})