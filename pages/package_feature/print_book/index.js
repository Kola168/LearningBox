// pages/package_feature/print_book/index.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: ['https://cdn-h.gongfudou.com/LearningBox/feature/album/album_1.jpg',
          'https://cdn-h.gongfudou.com/LearningBox/feature/album/album_2.jpg',
          'https://cdn-h.gongfudou.com/LearningBox/feature/album/album_3.jpg',
          'https://cdn-h.gongfudou.com/LearningBox/feature/album/album_4.jpg'
    ],
  },

  onLoad: function(options) {
    this.type=options.type||'photo_book'
  },
  
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_book/edit',{
      type:this.type
    })
  },
})
