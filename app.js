"use strict"
let {
  weToast
} = require('lib/toast/wetoast.js')
const regeneratorRuntime = require('lib/co/runtime')
const co = require('lib/co/co')
const util = require('utils/util')
<<<<<<< HEAD
import Logger from 'utils/logger.js'

const getSystemInfo = util.promisify(wx.getSystemInfo)

const login = util.promisify(wx.login)
const request = util.promisify(wx.request)
import storage from 'utils/storage.js'
=======
  // const _ = require('lib/underscore/we-underscore')
import Logger from 'utils/logger.js'

const getSystemInfo = util.promisify(wx.getSystemInfo)
const getStorage = util.promisify(wx.getStorage)
  // const setStorage = util.promisify(wx.setStorage)

const login = util.promisify(wx.login)
  // const getUserInfo = util.promisify(wx.getUserInfo)
  // const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
  // const uploadFile = util.promisify(wx.uploadFile)
  // const checkSession = util.promisify(wx.checkSession)
>>>>>>> develop-zhaoyf


App({
  weToast,
  version: '0.0.1',
  //线上地址
  // apiServer: 'https://epbox.gongfudou.com',
  // apiWbviewServer: 'https://epbox.gongfudou.com/',
  //王析理本地地址
  apiServer: 'http://epbox.natapp1.cc',
  apiWbviewServer: 'http://epbox.natapp1.cc/',
  authAppKey: 'iMToH51lZ0VrhbkTxO4t5J5m6gCZQJ6c',
  openId: '',
  unionId: '',
  sysInfo: null,
  navBarInfo: null,
  rpxPixel: 0.5,
  onLaunch: co.wrap(function* () {
    yield this.getOpenId()
    yield this.getSystemInfo()
    this.navBarInfo = this.getNavBarInfo()
  }),

  //获取系统信息
  getSystemInfo: co.wrap(function* () {
    let res = yield getSystemInfo()
    this.sysInfo = res
    this.handleDevice()
  }),

  // 是否为全面屏，rpxPixel
  handleDevice() {
    // 暂时的处理
    this.isFullScreen = this.sysInfo.screenHeight > 750 ? true : false
    this.rpxPixel = 750 / this.sysInfo.windowWidth
  },

  // 获取导航栏信息
  getNavBarInfo() {
    let sysInfo = this.sysInfo ? this.sysInfo : wx.getSystemInfoSync()
    let rect = null
    try {
      rect = wx.getMenuButtonBoundingClientRect()
    } catch (error) {
      rect = this.fixButtonBoundingClientRect()
    }
    let statusBarHeight = sysInfo.statusBarHeight,
      gap = rect.top - statusBarHeight,
      navBarHeight = 2 * gap + rect.height,
      navBarPadding = sysInfo.screenWidth - rect.right,
      topBarHeight = navBarHeight + statusBarHeight
    return {
      statusBarHeight,
      navBarHeight,
      topBarHeight,
      navBarPadding,
      titleWidth: sysInfo.screenWidth - navBarPadding * 2 - rect.width * 2,
      menuWidth: rect.width,
      menuHeight: rect.height
    }
  },

  // 修复wx.getMenuButtonBoundingClientRect接口报错，保证自定义导航栏不错位
  fixButtonBoundingClientRect() {
    let sysInfo = this.sysInfo,
      platform = sysInfo.platform.toLowerCase(),
      gap = '', //胶囊按钮上下间距 使导航内容居中
      width = 88 //胶囊的宽度，android大部分96，ios为88
    if (platform === 'android') {
      gap = 8
      width = 96
    } else if (platform === 'devtools') {
      let system = sysInfo.system.toLowerCase()
      if (system.indexOf('ios') > -1) {
        gap = 5.5 //开发工具中ios手机
      } else {
        gap = 7.5 //开发工具中android和其他手机
      }
    } else {
      gap = 4
      width = 88
    }
<<<<<<< HEAD
=======
    return {
      bottom: sysInfo.statusBarHeight + gap + 32,
      height: 32,
      left: sysInfo.windowWidth - width - 10,
      right: sysInfo.windowWidth - 10,
      top: sysInfo.statusBarHeight + gap,
      width: width
    };
>>>>>>> develop-zhaoyf
  },

  preventMoreTap: function (e) {
    if (_.isEmpty(e)) {
      return false
    }
    try {
      var globaTime = this.globalLastTapTime;
      var time = e.timeStamp;
      if (Math.abs(time - globaTime) < 500 && globaTime != 0) {
        this.globalLastTapTime = time;
        return true;
      } else {
        this.globalLastTapTime = time;
        return false;
      }
    } catch (e) {
      console.log(e)
    }
  },

  getOpenId: co.wrap(function* () {
    try {
<<<<<<< HEAD
      const sto = storage.get('openId')
      if (!sto) {
        return this.login()
      }
      this.openId = sto
=======
      const storage = yield getStorage({
        key: 'openid'
      })
      this.openId = storage.data
>>>>>>> develop-zhaoyf
    } catch (e) {
      this.login()
    }
  }),

  login: co.wrap(function* () {
    try {
      const loginCode = yield login()
      const loginInfo = yield request({
        url: this.apiServer + '/api/v1/users/sessions/wechat_jscode2session',
        method: 'POST',
        dataType: 'json',
        data: {
          'code': loginCode.code
        }
      })
      if (loginInfo.data.code !== 0) {
        throw (loginInfo.data)
      }
      storage.put('openId', loginInfo.data.res.openid)

      this.openId = loginInfo.data.res.openid
    } catch (e) {
      util.showErr({
        title: '登录失败',
        content: e.error
      })
      return
    }
  }),
})