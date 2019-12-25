// pages/package_subject/sync_learn/learn_content/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showSelectedText: false, //是否显示教材
    selectedBookIndex: -1, //教材版本选中下标
    textbookVersion: [
      {
        name: '浙教版',
        _id: 1
      },
      {
        name: '人教版',
        _id: 2
      },
      {
        name: '苏教版',
        _id: 3
      }
    ],
    gradeList: [] //年级列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },


  touchText: function() {
    this.setData({
      showSelectedText: !this.data.showSelectedText
    })
  },

  chooseTextbook: function(e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      selectedBookIndex: index,
      gradeList: [
        {
          name: '必修一',
          _id: 100
        },
        {
          name: '必修二',
          _id: 101
        },
        {
          name: '必修三',
          _id: 102
        },
        {
          name: '必修四',
          _id: 103
        },
      ]
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})