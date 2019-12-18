// pages/package_feature/print_name/index.js
import wxNav from '../../../utils/nav.js'

Page({
  data: {
    urls: ['https://cdn-h.gongfudou.com/LearningBox/feature/print_name/print_name_1.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/feature/print_name/print_name_2.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/feature/print_name/print_name_3.jpg'
    ],
  },

  onLoad: function(options) {
    this.type=options.type||'name_sticker'
  },
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_name/edit')
  },
})
