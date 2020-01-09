// pages/package_subject/stage_report/index/index.js
var app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0,
    isFullScreen: false
  },

  onLoad: function (options) {
    let navBarHeight = app.navBarInfo.topBarHeight
    this.setData({
      navBarHeight,
      isFullScreen: app.isFullScreen
    })
  },

  /**
   * 生成报告
   */
  createExercise: co.wrap(function*(){
    try {
      console.log('==createExercise==')
    } catch(err) {

    }
    
  }),

  onPullDownRefresh: function () {

  },

  onShareAppMessage: function () {

  }
})