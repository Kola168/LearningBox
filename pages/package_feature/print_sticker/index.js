// pages/package_feature/print_sticker/index.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: ['https://cdn-h.gongfudou.com/LearningBox/feature/sticker/sticker_1.jpg',
        'https://cdn-h.gongfudou.com/LearningBox/feature/sticker/sticker_2.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/feature/sticker/sticker_3.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/feature/sticker/sticker_4.jpg'
    ],
  },

  onLoad: function (options) {
    this.type=options.type||'photo_sticker'
  },
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_sticker/typeList',{
      type:this.type
    })
  },
})
