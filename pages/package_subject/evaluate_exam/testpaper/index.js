const app = getApp()
Page({
  data: {
    topBarHeight: 0,
    tabId: 'tab_0',
    typeSn: '',
    showEditions: false,
    papersTypes: [{
      sn: 1,
      name: '全部'
    }, {
      sn: 1,
      name: '期中'
    }, {
      sn: 1,
      name: '期末'
    }]
  },
  onLoad() {
    setTimeout(() => {
      this.setData({
        topBarHeight: app.navBarInfo.topBarHeight + 50
      })
    }, 300)
  },
  showEditions() {
    this.setData({
      showEditions: !this.data.showEditions
    })
  },
  changeType(e) {
    let tabId = e.currentTarget.id,
      typeSn = e.currentTarget.dataset.sn
    this.setData({
      typeSn,
      tabId
    })
  }
})