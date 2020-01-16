// pages/network/index.js
import wxNav from '../../../../utils/nav.js'
var app = getApp()

const event = require('../../../../lib/event/event')
const util = require('../../../../utils/util')


Page({

  data: {

  },

  onLoad: function(options) {
		this.longToast = new app.weToast()
  },
	
	onShow: function() {
	  if(!app.isScope()){
			wxNav.navigateTo('/pages/authorize/index')
		}
	},
   
  tobox: function() {
    wxNav.navigateTo('/pages/package_device/network/tips/step1')
  },

	toL3115:function(){
		wxNav.navigateTo('/pages/package_device/ble/printer/index')
	},
	
	onShareAppMessage: function() {

  }
})
