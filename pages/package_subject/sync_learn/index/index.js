// pages/package_subject/sync_learn/index/index.js
import {
  wxNav
} from '../../../../utils/common_import'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    entryList: [{
      title: '同步练习',
      desc: '五种难度智能出题',
      icon: '../../images/learn_icon.png',
      key: 'subject'
    }, {
      title: '同步视频',
      desc: '五种难度智能出题',
      icon: '../../images/video_icon.png',
      key: 'video'
    }]
  },

  onLoad: function (options) {

  },

  toUse: function ({
    currentTarget: {
      dataset: {
        key
      }
    }
  }) {
    if (key == 'video') {
      return wx.showModal({
        title: '提示',
        content: '该功能暂未开放',
        showCancel: false,
      })
    }

    wxNav.navigateTo('/pages/package_subject/sync_learn/learn_content/index', {
      key
    })

  },

  onHide: function () {

  },

  onPullDownRefresh: function () {

  },

  onShareAppMessage: function () {

  }
})