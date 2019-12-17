// pages/package_feature/print_thumb_album/index.js
import wxNav from '../../../utils/nav.js'

Page({
  data: {
    urls: ['https://cdn-h.gongfudou.com/LearningBox/feature/thumb_album/thumb_album_1.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/thumb_album/thumb_album_2.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/thumb_album/thumb_album_3.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/thumb_album/thumb_album_4.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/thumb_album/thumb_album_5.jpg'
    ],
  },

  onLoad: function(options) {
    this.type=options.type||'mini_album'
  },
  buysth: function() {

  },
  toedit: function(e) {
    wxNav.navigateTo('/pages/package_feature/print_thumb_album/photolist',{
      type:this.type
    })
  },
})
