// pages/package_feature/print_name/index.js
import wxNav from '../../../utils/nav.js'

Page({
  data: {
    urls: ['https://cdn.gongfudou.com/miniapp/ec/quweidayin/name/a1.png',
				'https://cdn.gongfudou.com/miniapp/ec/quweidayin/name/a2.png',
				'https://cdn.gongfudou.com/miniapp/ec/quweidayin/name/a3.png',
				'https://cdn.gongfudou.com/miniapp/ec/quweidayin/name/a4.png',
				'https://cdn.gongfudou.com/miniapp/ec/quweidayin/name/a5.png',
    ],
  },

  onLoad: function(options) {

  },
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_name/edit')
  },
})
