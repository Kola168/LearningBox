const app = getApp()
import { regeneratorRuntime, co, wxNav, util, storage } from '../../utils/common_import'

import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
  // page mixins
require('../../utils/mixin.js')
import index from "../../mixins/index.js"
import init from "../../mixins/init.js"
import gql from '../../network/graphql_request.js'
import api from '../../network/restful_request.js'
const checkSession = util.promisify(wx.checkSession)

Page({
  mixins: [index, init],
  data: {
    userInfo: {},
    bannerUrls: [],
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
    autoplay: true,
    interval: 5000,
    showAuth: false, //登录
    homeType: '学前',
    selectedKid: null,
    stageRoot: null
  },

  //事件处理函数
  bindViewTap: function() {
    wxNav.navigateTo('/pages/logs/logs')
  },
  onLoad: co.wrap(function*(query) {
    this.longToast = new app.weToast()
    let userSn = storage.get('userSn')
    if (query.scene) {
      this.scene = query.scene
      if (userSn) {
        this.handleScene(query.scene)
      }
    } else if (query.deviceSn) {
      this.deviceSn = query.deviceSn
      if (userSn) {
        this.bindShareDevice(query.deviceSn)
      }
    }
    try {

    } catch (e) {
      console.log(e)
    }

  }),
  onShow: co.wrap(function*() {
    yield this.getUnion() //授权
  }),
  getUnion: co.wrap(function*() {
    try {
      let authToken = storage.get('authToken')
      if (authToken) {
        this.setData({
          showAuth: false
        })
        app.authToken = authToken
        yield this.getUserInfo()
        yield this.getBanners()
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
  checkSession: co.wrap(function*() {
    try {
      yield checkSession()
      return true
    } catch (e) {
      return false
    }
  }),
  getBanners: co.wrap(function*() {
    try {
      let resp = yield gql.getBanners('home')
      this.setData({
        bannerUrls: resp.banners
      })
      console.log(resp)
    } catch (e) {
      util.showError(e)
    }
  }),
  getUserInfo: co.wrap(function*() {
    try {
      let resp = yield gql.getUser()
      this.setData({
        phone: resp.currentUser.phone,
        selectedKid: resp.currentUser.selectedKid,
        stageRoot: resp.currentUser.selectedKid.stageRoot
      })
      storage.put("userSn", resp.currentUser.sn)
      if (resp.currentUser.phone) {
        app.hasPhoneNum = true
        app.globalPhoneNum = resp.currentUser.phone
        wx.setStorageSync("phoneNum", resp.currentUser.phone)
      }
      if (!this.data.selectedKid || !this.data.selectedKid.stageRoot) {
        wxNav.navigateTo('/pages/index/grade')
      } else {
        this.setData({
          homeType: this.data.selectedKid.stageRoot.rootName
        })
      }

    } catch (e) {
      util.showError(e)
    }
  }),
  userInfoHandler: co.wrap(function*(e) {
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
      yield this.getBanners()
      if (this.scene) {
        this.handleScene(this.scene)
      }
      // 通过分享打印机
      if(this.deviceSn){
        this.bindShareDevice(this.deviceSn)
      }

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
  toNomalPrint: function(e) {
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
    wxNav.navigateTo(url)
  },
  // TODO:以下两个为测试函数，待删除
  changeSubject: function() {
    this.setData({
      homeType: this.data.homeType == 'subject' ? 'beforSchool' : 'subject'
    })
  },

  // 跳转小功能
  toFunction(e) {
    let functionId = e.currentTarget.id,
      url = ''
    switch (functionId) {
      case 'cognitionCard':
        url = '/pages/package_feature/cognition_card/index/index'
        break;
      case 'recordVoice':
        url = '/pages/package_preschool/record_voice/index/index'
        break;
      case 'freeResources':
        url = '/pages/package_common/free_resources/index/index'
        break;
    }
    wxNav.navigateTo(url)
  },

  // toId: function () {
  //   wxNav.navigateTo('/pages/print_id/index')
  // }

  // 处理scene
  handleScene(scene) {
    let sceneArr = scene.split('_'),
      sceneKey = sceneArr[0],
      sceneVal = sceneArr[1]
    switch (sceneKey) {
      case 'device':
        this.handleShareQrcode(sceneVal)
        break;
    }
  },

  // 处理分享打印机二维码
  handleShareQrcode: co.wrap(function*(val) {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let info = yield api.getShareDeviceInfo(val)
      if (info.code != 0) {
        throw (info)
      }
      this.bindShareDevice(info.res.device_sn)
      yield gql.bindShareDevice()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  }),

  // 绑定分享打印机
  bindShareDevice: co.wrap(function*(deviceSn) {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gql.bindShareDevice(deviceSn)
      if (res.bindSharer.device) {
        this.longToast.hide()
        wx.showToast({
          title: '绑定成功',
          icon: 'none',
          duration: 3000
        })
      }
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  })
})