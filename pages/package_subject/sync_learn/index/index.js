// pages/package_subject/sync_learn/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    entryList: [
      {
        title: '同步练习',
        desc: '五种难度智能出题',
        icon: '../../images/learn_icon.png',
        key: 'subject'
      }, {
        title: '同步练习',
        desc: '五种难度智能出题',
        icon: '../../images/video_icon.png',
        key: 'video'
      }
    ]
  },

  onLoad: function (options) {

  },

  toUse: function({currentTarget: {dataset: {key}}}) {
    console.log(key, 'xxxxx')
  },

  onHide: function () {

  },

  onPullDownRefresh: function () {

  },

  onShareAppMessage: function () {

  }
})