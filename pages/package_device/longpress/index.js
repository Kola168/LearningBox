Page({
  data: {
    navBarTitle: '长按打印设置',
    showSetting: false,
    switchFlag: false,
    modalObj: {
      isShow: false,
      title: '重要提醒',
      hasCancel: true,
      content: '关闭后，每次都需要您进入公众号手动确认后才能打印哦～'
    }
  },
  toSettingLongpress() {
    this.setData({
      showSetting: true
    })
  },
  handleLongpressSwitch() {
    let switchFlag = this.data.switchFlag
    if (switchFlag) {
      this.setData({
        ['modalObj.isShow']: true
      })
    } else {
      this.setData({
        switchFlag: !switchFlag
      })
    }
  },
  confirmModal() {
    this.setData({
      switchFlag: !this.data.switchFlag
    })
  },
  cancelModal(){
    this.setData({
      ['modalObj.isShow']:false
    })
  }
})