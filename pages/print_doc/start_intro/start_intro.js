const app = getApp()
Page({
  data: {
    imgs: {
      longPress: ['https://cdn.gongfudou.com/miniapp/ec/press33.png', 'https://cdn.gongfudou.com/miniapp/ec/press44.png', 'http://cdn.gongfudou.com/miniapp/ec/press22.png'],
      baiduPrint: ['https://cdn-h.gongfudou.com/LearningBox/feature/baidu_print_intro_1.png', 'https://cdn-h.gongfudou.com/LearningBox/feature/baidu_print_intro_2.png', 'https://cdn-h.gongfudou.com/LearningBox/feature/baidu_print_intro_3.png', 'https://cdn-h.gongfudou.com/LearningBox/feature/baidu_print_intro_4.png', 'https://cdn.gongfudou.com/miniapp/ec/baidu_print_55.png']
    },
    type: '',
    title: '',
    isFullScreen: false
  },
  onLoad: function(options) {
    let type = options.type
    this.setData({
      isFullScreen: app.isFullScreen,
      type: type,
      title: type === 'longPress' ? '长按打印' : '百度网盘',
      isFullScreen: app.isFullScreen
    })
  },
})