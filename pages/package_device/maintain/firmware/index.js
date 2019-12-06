Page({
  data: {
    modalObj: {
      isShow: false,
      hasCancel: true,
      title: '温馨提示',
      content: '更新需要15分钟左右的时间，在此期间请勿使用打印机或关闭电源',
      cancelText: '暂不更新',
      confirmText: '开始更新'
    }
  },
  checkUpdate() {
    this.setData({
      ['modalObj.isShow']: true
    })
  },
  updateConfirm() {

  }
})