// pages/package_feature/kousuan/previewWebview.js
const event = require('../../../lib/event/event')

Page({

  data: {

  },

  onLoad: function (options) {

  },

  getMessage:function(e){
    console.log(e)
    event.emit('webViewData', {
      url: resp.res.url,
      index: this.index ,
      direction:this.direction
    })
  },

})
