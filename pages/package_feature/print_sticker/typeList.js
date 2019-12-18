// pages/package_feature/print_sticker/typeList.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {

  },

  onLoad: function (options) {
    this.type=options.type||'photo_sticker'
  },
  checkType:function(e){
    let type=e.currentTarget.dataset.type
    wxNav.navigateTo('/pages/package_feature/print_sticker/imglist',{
      type:type,
      mediaType:this.type
    })
  }
})
