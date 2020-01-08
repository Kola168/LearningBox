const app = getApp()
import { regeneratorRuntime, co, util } from "../../../../utils/common_import"
import graphql from '../../../../network/graphql/device'
Page({
  data: {
    modalObj: {
      isShow: false,
      title: '设备离线',
      content: '设备离线，请检查打印机和左侧小白盒是否同时处于绿灯常亮状态'
    }
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.sn = query.sn
  },
  printTest: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      yield graphql.deviceMaintain(this.sn, 'nozzleCheck', 'name')
      this.weToast.hide()
      wx.showToast({
        icon: 'none',
        title: '测试页打印完成'
      })
    } catch (error) {
      this.weToast.hide()
      if (error.errors[0].message.indexOf('设备离线') > -1) {
        this.setData({
          ['modalObj.isShow']: true
        })
      } else {
        util.showError(error)
      }
    }
  })
})