const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../utils/common_import'
import api from '../../../network/restful_request'
const request = util.promisify(wx.request)
Page({
  data: {
    devices: [],
    isFullScreen: false
  },
  onLoad: function() {
    this.weToast = new app.weToast()
    this.setData({
        isFullScreen: app.isFullScreen
      })
      // this.getDevices()
  },
  getDevices: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield request({
        url: app.apiServer + `/boxapi/v2/printers`,
        method: 'GET',
        dataType: 'json',
        data: {
          'openid': 'oHTe45c3u5Y5xcUMd2Vw4c2SWjj4',
        }
      })
      console.log(resp.data.res)
      let tempData = resp.data
      if (tempData.code != 0) {
        throw (resp.data)
      }
      let devices = tempData.res.printers,
        activeDevice = tempData.res.selected_printer
      this.weToast.toast()
      this.setData({
        devices,
        activeDevice
      })
    } catch (e) {
      this.weToast.toast()
      util.showError(e)
      console.log(e)
    }
  }),

  // 设置打印机
  toSetting() {
    wxNav.navigateTo(`../setting/index`)
  },

  // 分享打印机
  toShare() {
    wxNav.navigateTo(`../share/index`)
  },

  // 切换打印机
  switchActiveDevice() {

  }
})