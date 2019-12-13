// pages/package_feature/print_postcard/index.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: ['https://cdn.gongfudou.com/miniapp/ec/quweidayin/postcard/a11.png',
      'https://cdn.gongfudou.com/miniapp/ec/quweidayin/postcard/a22.png',
      'https://cdn.gongfudou.com/miniapp/ec/quweidayin/postcard/a33.png',
      'https://cdn.gongfudou.com/miniapp/ec/quweidayin/postcard/a44.png',
      'https://cdn.gongfudou.com/miniapp/ec/quweidayin/postcard/a55.png'
    ],
  },

  onLoad: function (options) {

  },
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_postcard/edit')
  },
})
