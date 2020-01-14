// pages/package_preschool/exercise_day/certificate/index.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
import graphqlAll from '../../../../network/graphql_request'
import graphql from '../../../../network/graphql/preschool'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topBarHeight: 0,
    certOwnerNum: 0, //拥有奖状数量
    isShowModal: false,
    babyName: '',
    testimonials: null, //奖状列表
    user: null, //用户信息
  },

  onLoad: function (options) {
    this.longtoast = new app.weToast()
    this.setData({
      topBarHeight: app.navBarInfo.topBarHeight
    })
    this.getCertifacate()
    this.getUser()
  },

  onShow: function () {

  },

  /**
   * 获取用户信息
   */
  getUser: co.wrap(function*(){
    this.longtoast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphqlAll.getUser()
      this.setData({
        user: resp.currentUser
      })
    }catch(err) {
      util.showError(err)
    } finally {
      this.longtoast.hide()
    }
  }),

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
      if (resp && resp.testimonials) {
        var ownerCerts = resp.testimonials.filter(item=>item.isGet)
        this.setData({
          certOwnerNum: ownerCerts.length,
          testimonials: resp.testimonials
        })
      }
      
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
    console.log(this.data.user)
    if (this.data.user && this.data.user.selectedKid.name =='未命名') {
      return this.setData({
        isShowModal: true
      })
    }
    try {
      wxNav.navigateTo('/pages/package_common/setting/setting', {
        settingData: encodeURIComponent(JSON.stringify({
          // file: {
          //   name: '测试的名字'
          // },
          // orderPms: {
          //   url: item.imageUrl,
          //   printType: 'PRINTDOC',
          //   pageCount: 1,
          //   featureKey: 'testimonial',
          // },
          // checkCapabilitys: {
          //   isSettingColor: true,
          // }

          file: {
            name: item.title
          },
          orderPms: {
            printType: 'RESOURCE',
            pageCount: 1,
            featureKey: 'testimonial',
            resourceOrderType: 'Testimonial',
            resourceAttribute: {
              sn: item.sn,
              resourceType: 'Testimonial'
            }
          },
          checkCapabilitys: {
            isSettingColor: true,
          }
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
    if (this.data.babyName == '') {
      return wx.showModal({
        title: '提示',
        content: '请输入宝宝姓名'
      })
    }
    this.cancelModal()
    yield this.updateKidName()
  }),

  /**
   * 更新孩子姓名
   */
  updateKidName: co.wrap(function*(){
    try {
      yield graphqlAll.changeStage({
        kidAttributes: {
          name: this.data.babyName
        }
      })
      this.data.babyName =  ''
      yield this.getUser()
    } catch(err) {
      util.showError(err)
    }
  }),

  onPullDownRefresh: function () {

  },

  onShareAppMessage: function () {

  }
})