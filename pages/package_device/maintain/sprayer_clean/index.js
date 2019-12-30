const app = getApp()
import { regeneratorRuntime, co, util } from "../../../../utils/common_import"
import graphql from '../../../../network/graphql/device'
Page({
  data: {
    modalObj: {
      isShow: false,
      hasCancel: true,
      slotContent: true,
      title: '操作提示',
      cancelText: '暂不清洗',
      confirmText: '确认清洗'
    }
  },
  onLoad(query) {
    this.sn = query.sn
    this.weToast = new app.weToast()
  },
  sprayerClean() {
    this.setData({
      ['modalObj.isShow']: true
    })
  },
  confirmClean: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      yield graphql.deviceMaintain(this.sn, 'cleanPrinter', 'name')
      this.weToast.hide()
      wx.showToast({
        icon: 'none',
        title: '喷头清洗中'
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})