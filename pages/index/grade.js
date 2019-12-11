// pages/index/grade.js
const app = getApp()
import gql from '../../network/graphql_request.js'
import wxNav from '../../utils/nav.js'
import api from '../../network/restful_request.js'
import router from '../../utils/nav'
import {
  co,
  util
} from '../../utils/common_import.js'
import regeneratorRuntime from '../../lib/co/runtime'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    discipline: [
      ['0~3岁', '小班', '中、大班'],
      ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
      ['七年级', '八年级', '九年级'],
      ['高一', '高二', '高三']
    ],
    activeGrade: '0~3岁'
  },
  onLoad: function (options) {
    this.longToast = new app.weToast()
  },
  getAllstages: co.wrap(function () {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      resp = yield gql.getAllstages()
      console.log(resp)
      this.longToast.hide()
    } catch (e) {
      util.showError(e)
      this.longToast.hide()
    }
  }),
  chooseGrade: co.wrap(function* (e) {
    this.setData({
      activeGrade: e.currentTarget.id
    })
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
  }),


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