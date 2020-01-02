const app = getApp()
import { regeneratorRuntime, co, util } from "../../../../utils/common_import"
import graphql from '../../../../network/graphql/device'
Page({
  data: {
    updateInfo: '',
    modalObj: {
      isShow: false,
      hasCancel: true,
      title: '温馨提示',
      content: '更新需要15分钟左右的时间，在此期间请勿使用打印机或关闭电源',
      cancelText: '暂不更新',
      confirmText: '开始更新'
    }
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.sn = query.sn
    this.setData({
      updateInfo: query.updateInfo
    })
  },
  checkUpdate() {
    this.setData({
      ['modalObj.isShow']: true
    })
  },
  updateConfirm: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.deviceMaintain(this.sn, 'updatePrinter', 'updateInfo')
      this.weToast.hide()
      if (res.updateDeviceSetting.device.updateInfo) {
        wx.showToast({
          icon: 'none',
          title: '升级成功'
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: '暂无新固件'
        })
      }
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})