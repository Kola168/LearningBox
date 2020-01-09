const app = getApp()
Page({
  data: {
    isFullScreen: false,
    areaHeight: 0,
    imgList: ['https://cdn-h.gongfudou.com/tmp/2020/0/6/e373b670-305b-11ea-800a-159b646aca62-out-1.jpg', 'https://cdn-h.gongfudou.com/tmp/2020/0/6/e373b670-305b-11ea-800a-159b646aca62-out-1.jpg', 'https://cdn-h.gongfudou.com/tmp/2020/0/6/e373b670-305b-11ea-800a-159b646aca62-out-1.jpg', 'https://cdn-h.gongfudou.com/tmp/2020/0/6/e373b670-305b-11ea-800a-159b646aca62-out-1.jpg']
  },
  onLoad(query) {
    let isFullScreen = app.isFullScreen
    this.setData({
      isFullScreen,
      from: query.from,
      areaHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight - (isFullScreen ? 30 : 0)
    })
  }
})