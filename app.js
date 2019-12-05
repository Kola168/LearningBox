"use strict"
let {
  weToast
} = require('lib/toast/wetoast.js')
const regeneratorRuntime = require('lib/co/runtime')
const co = require('lib/co/co')
const util = require('utils/util')
import Logger from 'utils/logger.js'

const getSystemInfo = util.promisify(wx.getSystemInfo)

const login = util.promisify(wx.login)
const request = util.promisify(wx.request)
import storage from 'utils/storage.js'


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
  authToken:'',
  unionId: '',
  sysInfo: null,
  navBarInfo: null,
  rpxPixel: 0.5,
  onLaunch: co.wrap(function* () {
    yield this.getOpenId()
    yield this.getSystemInfo()
    this.navBarInfo = this.getNavBarInfo()
    this.handleDevice()
  }),

  //获取系统信息
  getSystemInfo: co.wrap(function* () {
    let res = yield getSystemInfo()
    this.sysInfo = res
    this.handleDevice()
  }),

  // 是否为iPhone X，rpxPixel
  handleDevice() {
    let model = this.sysInfo.model.toLowerCase()
    this.isIpx = model.indexOf("iphone x") > -1 ? true : false
    this.rpxPixel = 750 / this.sysInfo.windowWidth
  },

  // 获取导航栏信息
  getNavBarInfo() {
    let sysInfo = this.sysInfo ? this.sysInfo : wx.getSystemInfoSync()
    let rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
    if (rect) {
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
    }
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
      const sto = storage.get('openId')
      if (!sto) {
        return this.login()
      }
      this.openId = sto
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