// pages/network/index.js
import wxNav from '../../../../utils/nav.js'
var app =getApp()
Page({

  data: {

  },

  onLoad: function(options) {
		this.longToast = new app.weToast()
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
