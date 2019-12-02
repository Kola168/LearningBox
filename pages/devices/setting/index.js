const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
import api from '../../../network/restful_request'
import wxNav from '../../../utils/nav'
import util from '../../../utils/util'
Page({
  data: {
    devices:[]
  },
  onLoad: function(options) {
    this.weToast = new app.weToast()
    this.getDevices()
  },
  getDevices: co.wrap(function*() {
    this.weToast.toast({
      type:'loading'
    })
    try {
      let resp = yield api.getDevices('oHTe45c3u5Y5xcUMd2Vw4c2SWjj4')
      if (resp.code != 0) {
        throw (resp)
      }
      let devices = resp.res.printers
      this.weToast.toast()
      this.setData({
        devices: devices
      })
    } catch (e) {
      this.weToast.toast()
      util.showErr(e)
      console.log(e)
    }
  }),
  toIndex(){
    wxNav.navigateTo(`/pages/index/index`,{
      data:2,
      index:1
    })
  }
})