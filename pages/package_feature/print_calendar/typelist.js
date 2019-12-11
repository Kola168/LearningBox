// pages/package_feature/print_ calendar/typelist.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {

  },

  onLoad: function (options) {

  },

  tapType:function(e){
    wxNav.navigateTo('/pages/package_feature/print_calendar/index',{
      type:e.currentTarget.dataset.type
    })
  },
})
