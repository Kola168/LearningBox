Page({
  data: {
    modalObj: {
      isShow: false,
      title: '设备离线',
      content: '设备离线，请检查打印机和左侧小白盒是否同时处于绿灯常亮状态'
    }
  },
  printTest() {
    this.setData({
      ['modalObj.isShow']: true
    })
  }
})