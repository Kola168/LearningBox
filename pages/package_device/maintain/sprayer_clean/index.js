Page({
  data: {
    modalObj: {
      isShow: false,
      hasCancel: true,
      slotContent: true,
      title: '操作提示',
      cancelText: '暂不清洗',
      confirmText: '确认清洗'
    }
  },
  sprayerClean() {
    this.setData({
      ['modalObj.isShow']: true
    })
  },
  confirmClean(){

  }
})