const app = getApp()
Page({
  data: {
    isSubjectMember: true,
    areaHeight: 0,
    showSerial: false
  },
  onLoad() {
    let areaHeight = 0
    if (app.navBarInfo) {
      areaHeight = app.sysInfo.screenHeight - app.navBarInfo.topBarHeight
    } else {
      areaHeight = app.sysInfo.screenHeight - app.getNavBarInfo().topBarHeight
    }
    this.setData({
      areaHeight
    })
  },
  unfoldSerial() {
    this.setData({
      showSerial: !this.data.showSerial
    })
  }
})