// pages/package_feature/print_balloon/typelist.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    ballList: [
      { id: 38, name: "圆形气球" },
      { id: 39, name: "心形气球" },
      { id: 40, name: "星形气球" }
    ]
  },

  onLoad: function (options) {

  },

  checkType:function(e){
    wxNav.navigateTo('/pages/package_feature/print_balloon/edit',{
      id:e.currentTarget.dataset.id
    })
  },

})
