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
    loadReady: false,
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
    let navBarHeight = app.navBarInfo.topBarHeight
    this.setData({
      navBarHeight
    })
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
        devices = res.currentUser.devices,
        activeDevice = res.currentUser.selectedDevice,
        userSn = res.currentUser.sn

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
      loadReady: false,
      orders: [],
      activeDevice: this.data.devices[index]
    })
    this.getPrinterRecords()
  },
  // 获取打印记录
  getPrinterRecords: co.wrap(function*() {
    try {
      let res = yield graphql.getPrinterRecords(this.data.activeDevice.sn, this.page++),
        currentOrders = res.currentUser.devices[0].orders,
        orders = this.data.orders,
        showRemind = false
      if (currentOrders.length === 0) {
        this.setData({
          loadReady: true
        })
        this.weToast.hide()
        return
      }
      if (currentOrders.length < 20) {
        showRemind = true
      }
      this.setData({
        orders: orders.concat(currentOrders),
        loadReady: true,
        showRemind
      })
      this.weToast.hide()
    } catch (error) {
      console.log(error)
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 删除打印记录
  deleteRecord(e) {
    let state = e.currentTarget.dataset.state,
      content = ''
    if (state === 'finished') {
      // 删除的索引
      this.deleteIndex = e.currentTarget.dataset.index
      content = '删除后将无法查阅此订单，是否确认删除？'
      this.modalType = 'delete'
    } else {
      content = '未完成状态的订单暂时无法删除，如需取消打印，可点击下方按钮了解'
      this.modalType = 'cancelPrint'
    }
    this.setData({
      ['modalObj.isShow']: true,
      ['modalObj.content']: content
    })
  },

  // 拒绝或同意
  verifyOrder: co.wrap(function*(e) {
    let type = e.currentTarget.id,
      sn = e.currentTarget.dataset.sn
    try {
      yield graphql.verifyOrder(sn, type)
      this.page = 1
      this.setData({
        showRemind: false,
        loadReady: false,
        orders: []
      })
      this.getPrinterRecords()
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
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
  // 确认弹窗
  confirmModal() {
    let modalType = this.modalType
    if (modalType === 'delete') {
      console.log('接口暂未提供')
      // let orders = this.data.orders
      // //减少接口调用
      // if (orders.length >= 10) { //防止数据过少触发不了底部事件
      //   orders.splice(this.deleteIndex, 1)
      //   this.setData({
      //     orders
      //   })
      // } else {
      //   this.page = 1
      //   this.setData({
      //     showRemind: false,
      //     loadReady: false,
      //     orders: []
      //   })
      //   this.getPrinterRecords()
      // }
    } else if (modalType === 'cancelPrint') {
      wxNav.navigateTo('../cancel_intro/index')
    }
  },
  onReachBottom() {
    if (this.data.showRemind) return
    this.getRecord()
  }
})