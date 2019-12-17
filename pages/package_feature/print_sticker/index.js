// pages/package_feature/print_sticker/index.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: ['https://cdn.gongfudou.com/miniapp/ec/quweidayin/sticker/a1.png',
        'https://cdn.gongfudou.com/miniapp/ec/quweidayin/sticker/a2.png',
				'https://cdn.gongfudou.com/miniapp/ec/quweidayin/sticker/a3.png',
				'https://cdn.gongfudou.com/miniapp/ec/quweidayin/sticker/a4.png',
				'https://cdn.gongfudou.com/miniapp/ec/quweidayin/sticker/a5.png',
    ],
  },

  onLoad: function (options) {

  },
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_sticker/typeList')
  },
})
