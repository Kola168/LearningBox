// pages/package_feature/print_sticker/typeList.js
Page({

  data: {

  },

  onLoad: function (options) {

  },
  checkType:function(e){
    let type=e.currentTarget.dataset.type
    wxNav.navigateTo('/pages/package_feature/print_sticker/imglist',{
      type:type
    })
  }
})
