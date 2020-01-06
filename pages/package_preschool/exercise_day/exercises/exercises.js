// pages/package_preschool/exercise_day/exercises/exercises.js
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  onHide: function () {

  },

  // 去打印
  toPrint: co.wrap(function*(){
    console.log('==去打印给宝宝==')
  }),

  tobabyAnswer: co.wrap(function *() {
    console.log('==查看宝宝答案==')
  }),

  toMonthCompilation: co.wrap(function *() {
    console.log('==查看月度集合==')
  }),

  toBabyCertificate: co.wrap(function *() {
    console.log('去宝宝奖状')
  }),

})