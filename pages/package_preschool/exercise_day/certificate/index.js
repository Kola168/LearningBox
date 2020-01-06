// pages/package_preschool/exercise_day/certificate/index.js
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
    isShowModal: false,
    babyName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onShow: function () {

  },

  /**
   * 关闭录入宝宝姓名弹窗
   */
  cancelModal: function () {
    this.setData({
      isShowModal: false,
    })
  },

  /**
   * 去打印
   */
  toPrint: co.wrap(function *() {
    this.setData({
      isShowModal: true
    })
  }),

  /**
   * 录入宝宝姓名
   * @param {Object} param0 
   */
  inputBabyName: function ({detail}) {
    this.setData({
      babyName: detail.value
    })
  },

  submit: co.wrap(function *() {
    console.log(this.data.babyName,'babyName')  
    if (this.data.babyName == '') {
      return wx.showModal({
        title: '提示',
        content: '请输入宝宝姓名'
      })
    }
    this.data.babyName =  ''
    this.cancelModal()
  }),

  onPullDownRefresh: function () {

  },

  onShareAppMessage: function () {

  }
})