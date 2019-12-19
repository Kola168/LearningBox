const app = getApp()
Page({
  data: {
    imgs: {
      longPress: ['https://cdn.gongfudou.com/miniapp/ec/press33.png', 'https://cdn.gongfudou.com/miniapp/ec/press44.png', 'http://cdn.gongfudou.com/miniapp/ec/press22.png'],
      baiduPrint: ['https://cdn-h.gongfudou.com/LearningBox/feature/baidu_print_intro_1.png', 'https://cdn-h.gongfudou.com/LearningBox/feature/baidu_print_intro_2.png', 'https://cdn-h.gongfudou.com/LearningBox/feature/baidu_print_intro_3.png', 'https://cdn-h.gongfudou.com/LearningBox/feature/baidu_print_intro_4.png', 'https://cdn.gongfudou.com/miniapp/ec/baidu_print_55.png']
    },
    type: ''
  },
  onLoad: function(options) {
    let type = options.type
    this.setData({
      type: type,
      isFullScreen: app.isFullScreen
    })
  },
})