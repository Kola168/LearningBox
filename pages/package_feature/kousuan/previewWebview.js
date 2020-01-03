// pages/package_feature/kousuan/previewWebview.js
const app = getApp()

const event = require('../../../lib/event/event')
let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    webViewUrl:''
  },

  onLoad: function (options) {
    Loger(options.url)
    this.setData({
      webViewUrl:JSON.parse(decodeURIComponent(options.url))
    })
  },

  getMessage:function(e){
    Loger(e.detail.data[0])
    event.emit('webViewData',e.detail.data[0])
  },

})
