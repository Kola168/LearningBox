// pages/package_preschool/exercise_day/month_compilation/index.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/preschool'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    currentMonth: [],
    cateGorys: null //年份分类列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.longtoast = new app.weToast()
    this.getMonthCompilations()
  },

  bindPickerChange: function ({detail: {value}}) {
    this.setData({
      index: +value,
    })
    this.yearSn = this.data.cateGorys[+value].sn
    this.getPracticeCategory()
  },

    /**
   * 获取月度集合分类
   */
  getPracticeCategory: co.wrap(function *() {
    this.longtoast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getPracticeCategory(this.yearSn)
      var currentMonth = this.resetMonthData(resp.category.children)
      
      this.setData({
        currentMonth
      })
    }catch(err) {
      util.showError(err)
    } finally {
      this.longtoast.hide()
    }
  }),

    /**
   * 获取月度集合分类
   */
  getMonthCompilations: co.wrap(function *() {
    this.longtoast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getMonthCompilations()
      var currentMonth 
      if (resp.dailyPractice.practiceCategories && resp.dailyPractice.practiceCategories[0]) {
        currentMonth = this.resetMonthData(resp.dailyPractice.practiceCategories[0].children)
      }
      this.setData({
        currentMonth,
        cateGorys: resp.dailyPractice.practiceCategories
      })
    }catch(err) {
      util.showError(err)
    } finally {
      this.longtoast.hide()
    }
  }),

  resetMonthData: function (monthData) {
    try {
      var arr = [], itemArr = []
      monthData && monthData.forEach((item, index)=>{
        itemArr.push(item)
        if ((index + 1)  % 2 == 0 || index == monthData.length -1) {
          arr.push(itemArr)
          itemArr = []
        }
      })
      return arr.length <= 1 ? [...arr, [], []] : arr
    }catch(err) {
      
    }
  },
  
  toMonthDetail: function({currentTarget: {dataset: {item}}}) {
    wxNav.navigateTo('../month_compilation_subject/index', {
      sn: item.sn,
      month: item.name
    })
  },

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