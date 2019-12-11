const app = getApp()
Page({
  data: {
    imgs: {
      longPress: ['https://cdn.gongfudou.com/miniapp/ec/press33.png', 'https://cdn.gongfudou.com/miniapp/ec/press44.png', 'http://cdn.gongfudou.com/miniapp/ec/press22.png'],
      baiduPrint: ['https://cdn.gongfudou.com/miniapp/ec/baidu_print_11.png', 'https://cdn.gongfudou.com/miniapp/baidu/baidu_print_2.png', 'https://cdn.gongfudou.com/miniapp/baidu/baidu_print_3.png', 'https://cdn.gongfudou.com/miniapp/baidu/baidu_print_4.png', 'https://cdn.gongfudou.com/miniapp/ec/baidu_print_55.png']
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