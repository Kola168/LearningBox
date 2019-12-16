// pages/package_feature/print_postcard/index.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: ['https://cdn-h.gongfudou.com/LearningBox/feature/postcard/postcard_1.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/postcard/postcard_2.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/postcard/postcard_3.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/postcard/postcard_4.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/postcard/postcard_5.jpg'
    ],
  },

  onLoad: function (options) {
    this.type=options.type||'postcard'
  },
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_postcard/edit',{
      type:this.type
    })
  },
})
