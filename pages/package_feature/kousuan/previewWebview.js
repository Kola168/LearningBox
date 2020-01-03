// pages/package_feature/kousuan/previewWebview.js
const event = require('../../../lib/event/event')

Page({

  data: {
    webViewUrl:''
  },

  onLoad: function (options) {
    console.log(options.url)
    this.setData({
      webViewUrl:JSON.parse(decodeURIComponent(options.url))
    })
  },

  getMessage:function(e){
    console.log(e.detail.data[0])
    event.emit('webViewData',e.detail.data[0])
  },

})
