// pages/package_preschool/exercise_day/certificate/index.js
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
    isShowModal: false,
    babyName: '',
    testimonials: null, //奖状列表
  },

  onLoad: function (options) {
    this.longtoast = new app.weToast()
    this.getCertifacate()
  },

  onShow: function () {

  },

  /**
   * 获取奖状
   */
  getCertifacate: co.wrap(function *() {
    this.longtoast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getCertifacate()
      console.log(resp)
      this.setData({
        testimonials: resp.testimonials
      })
    }catch(err) {
      util.showError(err)
    } finally {
      this.longtoast.hide()
    }
  }),

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
  toPrint: co.wrap(function *({currentTarget: {dataset: {item}}}) {
    // this.setData({
    //   isShowModal: true
    // })
    try {
      wxNav.navigateTo('/pages/package_common/setting/setting', {
        settingData: encodeURIComponent(JSON.stringify({
          file: {
            name: '测试的名字'
          },
          orderPms: {
            url: item.imageUrl,
            printType: 'PRINTDOC',
            pageCount: 1,
            featureKey: 'testimonial',
          },
          checkCapabilitys: {
            isSettingColor: true,
          }

          // file: {
          //   name: '测试的名字'
          // },
          // orderPms: {
          //   printType: 'RESOURCE',
          //   pageCount: this.data.practiceQuestionImages.length,
          //   featureKey: 'daily_practice',
          //   resourceOrderType: 'DailyPractice',
          //   resourceAttribute: {
          //     sn: this.printSn,
          //     resourceType: 'Content',
          //     answer: true,
          //   }
          // },
          // checkCapabilitys: {
          //   isSettingColor: true,
          // }
       }))
      })
    } catch(err) {
      util.showError(err)
    }

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