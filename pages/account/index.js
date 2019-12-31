/*
 * @Author: your name
 * @Date: 2019-12-12 19:34:39
 * @LastEditTime: 2019-12-25 16:32:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/pages/account/index.js
 */
const app = getApp()
import gql from '../../network/graphql_request.js'
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../utils/common_import.js'
import storage from '../../utils/storage'
const event = require('../../lib/event/event')

Page({
  data: {
    kidInfo: null,
    activeDevice: null,
    features: [{
      title: '记录与收藏',
      features: [{
        name: '打印记录',
        image: '/images/account_print_record.png',
        url: '/pages/package_common/records/index/index',
      }, {
        name: '购买记录',
        image: '/images/account_order.png',
        url: '',
      }, {
        name: '我的收藏',
        image: '/images/account_cllection.png',
        url: '',
      }, ]
    }, {
      title: '帮助与反馈',
      features: [{
        name: '使用说明',
        image: '/images/account_use_info.png',
        url: '',
      }, {
        name: '意见反馈',
        image: '/images/account_feedback.png',
        url: '',
      }, {
        name: '在线客服',
        image: '/images/account_service.png',
        url: '',
      }, ]
    }, {
      title: '更多服务',
      features: [{
        name: '账号管理',
        image: '/images/account_manage.png',
        url: '',
      }, {
        name: '纸质化学习方法',
        image: '/images/account_paper.png',
        url: '',
      }, {
        name: '我的家庭',
        image: '/images/account_family.png',
        url: '/pages/package_member/group/index',
      }, ]
    }]
  },
  onLoad: function (options) {
    this.longToast = new app.weToast()
    event.on('Authorize', this, () => {
      this.userSn = storage.get('userSn')
      this.getUserInfo()
    })

  },
  onShow: co.wrap(function* () {
    let userSn = storage.get('userSn')
    this.userSn = userSn
    let isAuth = yield this.authCheck()
    if (isAuth) {
      yield this.getUserInfo()
    }
  }),
  authCheck: co.wrap(function* () {
    if (!this.userSn) {
      wxNav.navigateTo('/pages/authorize/index')
      return false
    } else {
      return true
    }
  }),

  getUserInfo: co.wrap(function* () {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      let resp = yield gql.getUser()
      console.log(resp)
      this.setData({
        kidInfo: resp.currentUser.selectedKid,
        activeDevice: resp.currentUser.selectedDevice
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),
  toFeature(e){
    wxNav.navigateTo(e.currentTarget.id)
  },
  toNext(e) {
    let pageKey = e.currentTarget.id,
      url = ''
    switch (pageKey) {
      case 'deviceList':
        url = '/pages/package_device/list/index'
        break;
      case 'addDevice':
        url = '/pages/package_device/network/index/index'
        break;
      case 'setInfo':
        url = '/pages/package_common/account/personal_info'
        break;
    }
    wxNav.navigateTo(url, {})
  },

  onlineGuest: co.wrap(function* () {
    let isAuth = yield this.checkIsScope()
    if (isAuth) {
      let url = 'https://gfd178.udesk.cn/im_client/?web_plugin_id=63138'
      wx.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(url)}`
      })
    }
  }),

  onUnload() {
    event.remove('Authorize', this)
  }
})