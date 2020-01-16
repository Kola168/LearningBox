const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util,
  storage
} from '../../utils/common_import'

import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
// page mixins
require('../../utils/mixin.js')
import index from "../../mixins/index.js"
import init from "../../mixins/init.js"
import gql from '../../network/graphql_request.js'
import gqlDevice from '../../network/graphql/device'
import api from '../../network/restful_request.js'
const checkSession = util.promisify(wx.checkSession)

import preschoolGql from '../../network/graphql/preschool.js'
import {
  updateSchool,
  commonFeatures
} from 'config.js'

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
    homeType: '',
    selectedKid: null,
    stageRoot: null,
    deviceModal: {
      isShow: false,
      hasCancel: false,
      content: '绑定设备后学习更方便!',
      confirmText: '立即绑定',
      image: '/images/home/device_tip.png'
    },
    beforeSchoolContent: [],
    userPlans: [],
    updateSchool,
    commonFeatures: [],
    gradeParent: null, //小学初中高中
    recommendCourse:[]
  },

  //事件处理函数
  bindViewTap: function () {
    wxNav.navigateTo('/pages/logs/logs')
  },
  onLoad: co.wrap(function* (query) {
    this.longToast = new app.weToast()
    let userSn = storage.get('userSn')
    if (query.scene) {
      this.scene = query.scene
      let userSn = storage.get('userSn')
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
        yield this.afterUnion()
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
  getBanners: co.wrap(function* () {
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

  //获取用户会员信息
  getMemeberInfo: co.wrap(function* () {
    let resp = yield commonRequest.getMemberInfo()
    console.log('会员信息==========', resp)
  }),


  getUserInfo: co.wrap(function* () {
    try {
      let resp = yield gql.getUser()
      this.setData({
        phone: resp.currentUser.phone,
      })
      if (!resp.currentUser.selectedKid || !resp.currentUser.selectedKid.stageRoot) {
        wxNav.navigateTo('/pages/index/grade')
      } else {
        let rootKey = resp.currentUser.selectedKid.stageRoot.rootKey
        let common = commonFeatures[rootKey]
        this.setData({
          homeType: rootKey,
          commonFeatures: commonFeatures[rootKey],
          gradeParent: resp.currentUser.selectedKid.stage.parent
        })
      }
      if (!resp.currentUser.selectedDevice) {
        this.setData({
          'deviceModal.isShow': true
        })
      }
    } catch (e) {
      util.showError(e)
    }
  }),
  //获取学前模块
  customizeFeatures: co.wrap(function* () {
    if (this.data.homeType != 'preschool') {
      return
    }
    try {
      let resp = yield gql.customizeFeatures()
      this.setData({
        beforeSchoolContent: resp.customizeFeatures
      })
    } catch (error) {
      util.showError(error)
    }
  }),
  //宝贝学习计划
  getUserPlans: co.wrap(function* () {
    if (this.data.homeType != 'preschool') {
      return
    }
    try {
      let resp = yield preschoolGql.getUserPlans('subscription')
      console.log('resp=====', resp)
      this.setData({
        userPlans: resp.userPlans
      })
    } catch (error) {
      util.showError(error)
    }
  }),
  // 心选课程推荐
  getCourse: co.wrap(function* () {
    if (this.data.homeType != 'subject') {
      return
    }
    try {
      var respRecommend = yield gql.getCourses('recommendation')

      this.setData({
        recommendCourse: respRecommend.courses,
      })
    } catch (error) {
      util.showError(error)
    }
  }),
  afterUnion: co.wrap(function* () {
    try {
      yield this.getUserInfo()
      yield this.getBanners()
      yield this.getUserPlans() //宝贝学习计划
      yield this.customizeFeatures() //学前内容模块
      yield this.getCourse() //心选课程
    } catch (error) {
      console.log(error)
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
      storage.put("userSn", resp.res.sn)
      if (resp.res.phone) {
        storage.put("phoneNum", resp.res.sn)
      }

      app.authToken = resp.res.auth_token
      this.setData({
        showAuth: false
      })
      yield this.afterUnion()
      if (this.scene) {
        this.handleScene(this.scene)
      }
      // 通过分享打印机
      if (this.deviceSn) {
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
        // wx.showToast({
        // 	title: '暂未开放，敬请期待',
        // 	icon: 'none',
        // 	duration: 2000
        // })
        break
        defalt:
          url = ''
    }
    wxNav.navigateTo(url)
  },

  // 跳转小功能
  toFunction(e) {
    let url = e.currentTarget.dataset.url
    if (!url) {
      return wx.showModal({
        title: '提示',
        content: '暂未开放，敬请期待',
        showCancel: false,
      })
    }
    wxNav.navigateTo(url)
  },

  toLearnCenter: co.wrap(function* () {
    wxNav.switchTab('/pages/course/index')
  }),
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
  handleShareQrcode: co.wrap(function* (val) {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let info = yield api.getShareDeviceInfo(val)
      if (info.code != 0) {
        throw (info)
      }
      this.bindShareDevice(info.res.device_sn)
      // yield gql.bindShareDevice()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  }),

  // 绑定分享打印机
  bindShareDevice: co.wrap(function* (deviceSn) {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gqlDevice.bindShareDevice(deviceSn)
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
  }),
  toBindDevice: function () {
    wxNav.navigateTo('/pages/package_device/network/index/index')
  },
  toContentList: function (e) {
    if (!e.currentTarget.dataset.has) {
      return
    }
    wxNav.navigateTo('/pages/package_common/common_content/index', {
      key: e.currentTarget.id,
      name: e.currentTarget.dataset.name
    })
  },
  changeSwiper: co.wrap(function* (e) {
    this.data.current = e.detail.current
  }),

  addPlan: co.wrap(function* (e) {
    wxNav.navigateTo('/pages/package_preschool/growth_plan/list/index')
  }),

  moreLearingPlan: co.wrap(function* (e) {
    wxNav.navigateTo('/pages/package_preschool/growth_plan/list/index')
  })

})