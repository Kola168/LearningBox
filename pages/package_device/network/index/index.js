/*
 * @Author: your name
 * @Date: 2019-12-10 09:11:17
 * @LastEditTime: 2019-12-10 18:14:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/pages/package_device/network/index/index.js
 */
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

  onShareAppMessage: function() {

  }
})
