// components/bottom-button/index.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const _ = require('../../lib/underscore/we-underscore')
const util = require('../../utils/util')

import storage from '../../utils/storage.js'
import gql from '../../network/graphql_request'
import commonRequest from '../../utils/common_request'
let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Component({
  externalClasses: ['extra-class', 'left-class'],
  properties: {
    textLeft: {
      type: String,
      observer: function(newval) {
        this.setData({
          textLeft: newval
        })
      }
    },
    textRight: {
      type: String,
      observer: function(newval) {
        this.setData({
          textRight: newval
        })
      }
    },
    getPhone: {
      type: Boolean,
      observer: function(newval) {
        if (newval) {
          this.setData({
            showPhone: newval
          })
        }
      }
    },
    mustGet: {
      type: Boolean,
      observer: function(newval) {
        if (newval) {
          this.setData({
            mustGetPhone: true,
          })
        }
      }
    }
  },

  attached: function() {
    try {
      let phoneNumGet = storage.get('phoneNumGet')
      let phoneNum = storage.get('phoneNum')
      Loger(phoneNumGet,phoneNum)
      // if (phoneNumGet == 'showed'||_.isNotEmpty(phoneNum)) {
      //   this.setData({
      //     phoneNumGet: 'showed'
      //   })
      // } else {
      //   this.setData({
      //     phoneNumGet: 'notShown'
      //   })
      // }
      if(this.data.mustGetPhone && _.isEmpty(phoneNum)){
        this.setData({
          phoneNumGet: 'notShown',
          showPhone:true
        })
      }
    } catch (e) {
      this.setData({
        phoneNumGet: 'notShown',
        showPhone:true
      })
      Loger('获取本地缓存失败')
    }
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    } else if (app.isFullScreen == undefined) {
      let that = this
      setTimeout(function() {
        that.setData({
          butHigh: app.isFullScreen
        })
      }, 500)
    }

  },

  data: {
    textLeft: '',
    textRight: '',
    butHigh: false, //是否全面屏
    showPhone: false,
    mustGetPhone: false, // 是否强制授权
    phoneNumGet: 'showed',
  },

  methods: {

    getPhoneNum: co.wrap(function*(e) {
      console.log(e)
      if (_.isEmpty(e.detail.iv) || _.isEmpty(e.detail.encryptedData)) {
        if(this.data.mustGetPhone){
          return wx.showModal({
            title:'提示',
            content:'该功能必须授权手机号才能正常使用哦！',
            showCancel: false,
            confirmColor: '#FFE27A',
          })
        }
      } else {
        try{
          let phone=yield commonRequest.phoneDecrypt(e)
        }catch(e){
          Loger(e)
          return util.showError(e)
        }
      }
      storage.put('phoneNumGet', 'showed')
      this.setData({
        phoneNumGet: 'showed'
      })
      this.triggerEvent('righttap')
    }),

    leftTap: function() {
      this.triggerEvent('lefttap')
    },
    rightTap: function() {

      this.triggerEvent('righttap')
    }
  }
})
