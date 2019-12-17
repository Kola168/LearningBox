// pages/package_feature/print_balloon/index.js

import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: ['https://cdn-h.gongfudou.com/LearningBox/feature/balloon/balloon_intro_01.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/balloon/balloon_intro_02.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/balloon/balloon_intro_03.jpg',
      'https://cdn-h.gongfudou.com/LearningBox/feature/balloon/balloon_intro_04.jpg',
    ],
  },

  onLoad: function(options) {
    this.type=options.type||'balloon'
  },

  buysth:function(){

  },

  toedit:function(e){
    try{
        wxNav.navigateTo('/pages/package_feature/print_balloon/typelist',{
          type:this.type
        })
    }catch(e){
      console.log(e)
    }

  },

  onShareAppMessage: function() {

  }
})
