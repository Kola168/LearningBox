"use strict"
const app = getApp()
import { regeneratorRuntime, co, wxNav, util } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'

Page({
  data: {
    orders: [],
    isOwner: false,
    //黑色浮层提示
    showInterceptModal: '',
    activeDevice: null,
    devices: [],
    activeDevice: null,
    changeType: false,
    activeType: 'all',
    showDeleteRecordModal: false,
    recordModalType: 'delete',
    deleteRecordSn: null,
    showRemind: false, //是否显示展示数据提示
    hasEcPrinter: false,
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
        activeDevice = null
      for (let i = 0; i < devices.length; i++) {
        if (devices[i].selected) {
          activeDevice = devices[i]
        }
      }
      this.setData({
        devices,
        activeDevice
      })
      if (activeDevice) {
        this.activeDeviceSn = activeDevice.sn
        this.getPrinterRecords()
      }
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 获取打印记录
  getPrinterRecords: co.wrap(function*() {
    try {
      let res = yield graphql.getPrinterRecords(this.activeDeviceSn, this.page++)
      console.log('iii', res)
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
})