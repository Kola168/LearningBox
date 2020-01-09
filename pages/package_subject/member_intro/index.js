const app = getApp()
Page({
  data: {
    isFullScreen: false
  },
  onLoad() {
    this.setData({
      isFullScreen: app.isFullScreen
    })
  }
})