// pages/package_feature/print_balloon/index.js

import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: ['https://cdn.gongfudou.com/miniapp/ec/quweidayin/balloon/balloon_intro_04.png',
      'https://cdn.gongfudou.com/miniapp/ec/quweidayin/balloon/balloon_intro_05.png',
      'https://cdn.gongfudou.com/miniapp/ec/quweidayin/balloon/balloon_intro_06.png',
      'https://cdn.gongfudou.com/miniapp/ec/quweidayin/balloon/balloon_intro_07.png',
      'https://cdn.gongfudou.com/miniapp/ec/quweidayin/balloon/balloon_intro_08.png',
      'https://cdn.gongfudou.com/miniapp/ec/quweidayin/balloon/balloon_intro_10.png'
    ],
  },

  onLoad: function(options) {

  },

  buysth:function(){

  },

  toedit:function(e){
    try{
        wxNav.navigateTo('/pages/package_feature/print_balloon/typelist')
    }catch(e){
      console.log(e)
    }

  },

  onShareAppMessage: function() {

  }
})
