const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
const co = require('../../../../lib/co/co')
const _ = require('../../../../lib/underscore/we-underscore')
const util = require('../../../../utils/util')
const request = util.promisify(wx.request)
import wxNav from '../../../../utils/nav.js'

Page({
	
	onLoad: function(options) {
	 this.longToast = new app.weToast()
	 if (options.equipInfo) {
		this.equipInfo = options.equipInfo
		this.setData({
			serial:JSON.parse(decodeURIComponent(options.equipInfo)).DeviceID
		})
	}
  },
	
	
	setAp:function(){
    	wxNav.navigateTo('/pages/package_device/network/wificonnect/list',{equipInfo:this.equipInfo})
	},

	ignoreAp: co.wrap(function*() {
    try {
      const resp = yield request({
        url: 'http://192.168.178.1:1788/exit',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {},
        dataType: 'json'
      })
      if (resp.data.code == 0) {
        this.longToast.toast()
        return wxNav.switchTab('/pages/index/index')
      }
      return
    } catch (e) {
			this.longToast.toast()
      util.showError(e)
    }
  }),
})