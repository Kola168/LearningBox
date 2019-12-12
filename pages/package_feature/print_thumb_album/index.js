// pages/package_feature/print_thumb_album/index.js
import wxNav from '../../../utils/nav.js'

Page({
  data: {
    urls: ['http://cdn.gongfudou.com/miniapp/ec/print_thumb_index_1.png',
      'http://cdn.gongfudou.com/miniapp/ec/quweidayin/thumb/a11.png',
      'http://cdn.gongfudou.com/miniapp/ec/quweidayin/thumb/a22.png',
      'http://cdn.gongfudou.com/miniapp/ec/quweidayin/thumb/a33.png',
      'http://cdn.gongfudou.com/miniapp/ec/quweidayin/thumb/a44.png',
      'http://cdn.gongfudou.com/miniapp/ec/quweidayin/thumb/a55.png',
    ],
  },

  onLoad: function(options) {

  },
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_thumb_album/photolist')
  },
})
