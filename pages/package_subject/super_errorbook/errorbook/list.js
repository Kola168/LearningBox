const app = getApp()
Page({
  data: {
    isMember: true,
    navBarHeight: 0,
    showFilter: false,
    modalObj: {
      isShow: false,
      slotBottom: true,
      title: '开通学科会员 小白帮你消灭错题',
      image: 'https://cdn-h.gongfudou.com/LearningBox/subject/toast_super_errorbook.png'
    }
  },
  onLoad() {
    this.setData({
      navBarHeight: app.navBarInfo ? app.navBarInfo.topBarHeight : app.getNavBarInfo().topBarHeight
    })
  },
  hideFilter() {
    this.setData({
      showFilter: false
    })
  },
  checkFilter() {

  }
})