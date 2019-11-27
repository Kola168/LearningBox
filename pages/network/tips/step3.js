// pages/network/tips/step3.js
const app = getApp()
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    isIphone:false,
  },

  onLoad: function (options) {
    if(app.sysInfo.model.indexOf('iPhone')>=0){
      this.setData({
        isIphone:true
      })
    }
  },

})
