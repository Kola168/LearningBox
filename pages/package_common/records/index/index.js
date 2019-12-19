"use strict"
const app = getApp()
import { regeneratorRuntime, co, wxNav, util, storage } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'

Page({
  data: {
    orders: [],
    devices: [],
    userSn: null,
    activeDevice: null,
    changeType: false,
    showRemind: false,
    navBarHeight: 0,
    showDeviceList: false,
    modalObj: {
      isShow: false,
      title: '温馨提示',
      hasCancel: true,
      content: ''
    }
  },
  onLoad: co.wrap(function*(options) {
    this.weToast = new app.weToast()
    this.page = 1
    setTimeout(() => {
      let navBarHeight = app.navBarInfo.topBarHeight
      this.setData({
        navBarHeight
      })
    }, 300)
    this.getDeviceList()
  }),
  showDeviceList() {
    if (this.data.devices.length === 1) return
    this.setData({
      showDeviceList: !this.data.showDeviceList
    })
  },
  // 获取打印机列表
  getDeviceList: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getDeviceList(),
        devices = res.devices,
        activeDevice = null,
        userSn = res.currentUser.sn
      for (let i = 0; i < devices.length; i++) {
        if (devices[i].selected) {
          activeDevice = devices[i]
        }
      }
      this.setData({
        devices,
        activeDevice,
        userSn
      })
      if (activeDevice) {
        this.getPrinterRecords()
      }
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 切换打印机
  changeDevice(e) {
    let index = e.currentTarget.dataset.index
    this.page = 1
    this.setData({
      showDeviceList: false,
      showRemind: false,
      orders: [],
      activeDevice: this.data.devices[index]
    })
    this.getPrinterRecords()
  },
  // 获取打印记录
  getPrinterRecords: co.wrap(function*() {
    try {
      let res = yield graphql.getPrinterRecords(this.data.activeDevice.sn, this.page++),
        currentOrders = res.printOrders,
        orders = this.data.orders,
        showRemind = false
      if (currentOrders.length === 0) {
        this.weToast.hide()
        return
      }
      if (currentOrders.length < 20) {
        showRemind = true
      }
      this.setData({
        orders: orders.concat(currentOrders),
        showRemind
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 删除打印记录
  deleteRecord(e) {
    this.setData({
      ['modalObj.isShow']: true,
      ['modalObj.content']: '未完成状态的订单暂时无法删除，如需取消打印，可点击下方按钮了解'
    })
  },
  // 跳转详情
  toDetail(e) {
    if (app.preventMoreTap(e)) return
    let userSn = e.currentTarget.dataset.usersn
    if (this.data.userSn == userSn) {
      let sn = e.currentTarget.dataset.sn
      wxNav.navigateTo(`../detail/index`, {
        sn: sn
      })
    }
  },
  onReachBottom() {
    if (this.data.showRemind) return
    this.getRecord()
  }
})