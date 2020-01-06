// pages/package_preschool/exercise_day/answer/index.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShow: function () {

  },

  toPrint: co.wrap(function *() {
    console.log('去打印')
  }),

  onShareAppMessage: function () {

  }
})