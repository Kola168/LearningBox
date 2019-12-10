// pages/package_feature/print_book/index.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: ['https://cdn.gongfudou.com/miniapp/ec/quweidayin/album/a11.png',
          'https://cdn.gongfudou.com/miniapp/ec/quweidayin/album/a22.png',
          'https://cdn.gongfudou.com/miniapp/ec/quweidayin/album/a33.png',
          'https://cdn.gongfudou.com/miniapp/ec/quweidayin/album/a44.png',
          'https://cdn.gongfudou.com/miniapp/ec/quweidayin/album/a55.png',
          'https://cdn.gongfudou.com/miniapp/ec/quweidayin/album/a66.png',
          'https://cdn.gongfudou.com/miniapp/ec/quweidayin/album/a77.png'
    ],
  },

  onLoad: function(options) {

  },
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_book/edit')
  },
})
