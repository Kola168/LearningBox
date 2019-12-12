const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../utils/common_import'
import graphql from '../../../network/graphql_request'
const request = util.promisify(wx.request)
Page({
  data: {
    devices: [],
    activeDevice: {},
    isFullScreen: false
  },
  onLoad: function() {
    this.weToast = new app.weToast()
    this.setData({
      isFullScreen: app.isFullScreen
    })
    this.getDevices()
  },
  getDevices: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getDeviceList()
      let devices = res.printers,
        activeDevice = {}
      for (let i = 0; i < devices.length; i++) {
        if (devices[i].selected) {
          activeDevice = devices[i]
        }
      }
      this.weToast.toast()
      this.setData({
        devices,
        activeDevice
      })
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

  // 设置打印机
  toSetting() {
    if (app.preventMoreTap(e)) {
      return
    }
    let sn = e.currentTarget.dataset.sn
    wxNav.navigateTo(`../setting/index`,{
      sn
    })
  },

  // 分享打印机
  toShare(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    let sn = e.currentTarget.dataset.sn
    wxNav.navigateTo(`../share/index`, {
      sn
    })
  },

  // 切换打印机
  switchActiveDevice() {
    if (app.preventMoreTap(e)) {
      return
    }
    let sn = e.currentTarget.dataset.sn
  },
  // 添加打印机
  addDevice() {
    wxNav.navigateTo('../network/index/index')
  },
  // 下拉刷新
  refreshData() {

  },

})