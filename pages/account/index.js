/*
 * @Author: your name
 * @Date: 2019-12-12 19:34:39
 * @LastEditTime: 2019-12-17 09:46:12
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

const getUserInfo = util.promisify(wx.getUserInfo)

Page({
  data: {
    kidInfo: null,
    activeDevice: null
  },
  onLoad: function(options) {
    this.longToast = new app.weToast()
  },
  onShow: co.wrap(function*() {
    yield this.getUserInfo()
    yield this.getActiveDevice()
  }),

  getUserInfo: co.wrap(function*() {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      let resp = yield gql.getUser()
      this.setData({
        kidInfo: resp.currentUser.selectedKid,
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),
  // 获取选中的打印机
  getActiveDevice: co.wrap(function*() {
    try {
      let res = yield gql.getDeviceList(),
        devices = res.devices,
        activeDevice = {}
      if (devices.length === 0) return
      for (let i = 0; i < devices.length; i++) {
        if (devices[i].selected) {
          activeDevice = devices[i]
        }
      }
      this.setData({
        activeDevice
      })
    } catch (error) {
      util.showError(error)
    }
  }),

  toDeviceList(){
    wxNav.navigateTo('/pages/package_device/list/index')
  },

  toSetInfo: function() {
    wxNav.navigateTo('/pages/package_common/account/personal_info')
  },

  addDevice: function() {
    wxNav.navigateTo('/pages/package_device/network/index/index')
  }
})