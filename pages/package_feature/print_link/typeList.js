// pages/package_feature/print_link/typeList.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {

  },

  onLoad: function (options) {

  },

  chooseType:function(e){
    let type=e.currentTarget.dataset.type
    wxNav.navigateTo('pages/package_feature/print_link/desc',{
      type:type
    })
  },

})
