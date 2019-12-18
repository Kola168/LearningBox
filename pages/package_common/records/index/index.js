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

  onShow: co.wrap(function*() {

  }),
  showDeviceList() {
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
  changeDevice(e){
    let index = e.currentTarget.dataset.index
    this.setData({
      showDeviceList:false,
      activeDevice:this.data.devices[index]
    })
  },
  // 获取打印记录
  getPrinterRecords: co.wrap(function*() {
    try {
      let res = yield graphql.getPrinterRecords(this.data.activeDevice.sn, this.page++)
      this.setData({
        orders: res.printOrders
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
    console.log(e)
    if (app.preventMoreTap(e)) return
    let userSn = e.currentTarget.dataset.userSn
    if (this.data.usersn == userSn) {
      let sn = e.currentTarget.dataset.sn
      wxNav.navigateTo(`../detail/index`, {
        sn: sn
      })
    }
  }
})