const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
import api from '../../../network/restful_request'
import wxNav from '../../../utils/nav'
import util from '../../../utils/util'
const request = util.promisify(wx.request)
Page({
  data: {
    devices: [],
    isIpx:false
  },
  onLoad: function() {
    this.weToast = new app.weToast()
    this.setData({
      isIpx:app.isIpx
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
      util.showErr(e)
      console.log(e)
    }
  }),
  toIndex() {
    wxNav.navigateTo(`../../logs/logs`)
  }
})