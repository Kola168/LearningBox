const app = getApp()
const event = require('../../../lib/event/event')
import { regeneratorRuntime, co, util, wxNav } from '../../../utils/common_import'
import graphql from '../../../network/graphql/device'
Page({
  data: {
    devices: null,
    activeDevice: null,
    isFullScreen: false
  },
  onLoad: function() {
    this.weToast = new app.weToast()
    this.setData({
      isFullScreen: app.isFullScreen
    })
    this.getDevices()
    event.on('deviceChange', this, () => {
      this.getDevices()
    })
  },
  getDevices: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getDeviceList()
      let devices = res.currentUser.devices,
        activeDevice = res.currentUser.selectedDevice
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
  toSetting(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    let sn = e.currentTarget.dataset.sn
    wxNav.navigateTo(`../setting/index`, {
      sn: sn
    })
  },

  // 分享打印机
  toShare(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    wxNav.navigateTo(`../share/index`, {
      shareQrcode: encodeURIComponent(JSON.stringify(this.data.activeDevice.shareQrcode)),
      deviceSn: e.currentTarget.dataset.sn
    })
  },

  // 切换打印机
  switchActiveDevice: co.wrap(function*(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let sn = e.currentTarget.dataset.sn
      yield graphql.updateDeviceSetting(sn, {
        select: true
      }, 'selected')
      this.getDevices()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 添加打印机
  addDevice() {
    wxNav.navigateTo('../network/index/index')
  },
  // 下拉刷新
  refreshData() {
    this.getDevices()
  },
  onUnload() {
    event.remove('deviceChange', this)
  }
})