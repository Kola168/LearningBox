// pages/package_feature/print_link/desc.js
Page({

  data: {
    imgArr:[],
    title:'链接打印',
    wx:{
      title:'获取微信公众号文章链接',
      imgurl:['https://cdn-h.gongfudou.com/LearningBox/feature/print_lint_wx1.png','https://cdn-h.gongfudou.com/LearningBox/feature/print_lint_wx2.png','https://cdn-h.gongfudou.com/LearningBox/feature/print_lint_wx3.png']
    },
    baiddu:{
      title:'获取百度文章链接',
      imgurl:['https://cdn-h.gongfudou.com/LearningBox/feature/print_lint_baidu1.png','https://cdn-h.gongfudou.com/LearningBox/feature/print_lint_baidu2.png','https://cdn-h.gongfudou.com/LearningBox/feature/print_lint_baidu3.png']
    },
    qiangguo:{
      title:'获取学习强国文章链接',
      imgurl:['https://cdn-h.gongfudou.com/LearningBox/feature/print_lint_qiangguo1.png','https://cdn-h.gongfudou.com/LearningBox/feature/print_lint_qiangguo2.png','https://cdn-h.gongfudou.com/LearningBox/feature/print_lint_qiangguo3.png']
    }
  },

  onLoad: function (options) {
    this.setData({
      imgArr:this.data[options.type].imgurl,
      title:this.data[options.type].title,
    })
  },

})
