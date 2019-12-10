// pages/network/tips/index.js
const app = getApp()
import wxNav from '../../../../utils/nav.js'

Page({

  data: {

  },

  onLoad: function(options) {
    if(app.sysInfo.model.indexOf('iPhone')>=0){
      this.setData({
        isIphone:true
      })
    }
  },

  nextStep:function(){
    wxNav.navigateTo('/pages/package_device/network/tips/step2',{asd:1})
  }

})
