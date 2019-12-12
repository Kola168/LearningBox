// pages/package_feature/print_sticker/imglist.js
Page({
  data: {
    modeSize:{
      two:{
        vertical:{
          width:567,
          height:827,
        },
        horizontal:{
          width:827,
          height:567,
        },
      },
      four:{
        vertical:{
          width:567,
          height:827,
        },
        horizontal:{
          width:827,
          height:567,
        },
      }
    },
    type:null,  //选中的类型
  },

  onLoad: function (options) {
    this.type=options.type
  },

})
