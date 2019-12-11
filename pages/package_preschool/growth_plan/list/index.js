// pages/package_preschool/list/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showSetting: false,
    switchFlag: false,
    modalObj: {
      isShow: false,
      title: '',
      hasCancel: true,
      content: ''
    }         
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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