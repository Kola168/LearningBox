// pages/network/tips/step2.js
import wxNav from '../../../../utils/nav.js'

Page({

  data: {

  },

  onLoad: function(options) {
    console.log(options)
  },
  nextStep: function() {
    wxNav.navigateTo('/pages/package_device/network/tips/step3')
  }
})
