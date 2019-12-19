// components/bottom-button/index.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const _ = require('../../lib/underscore/we-underscore')
const util = require('../../utils/util')

import storage from '../../utils/storage.js'
import gql from '../../network/graphql_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Component({
  externalClasses:['my-class'],
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
    getPhone:{
      type: Boolean,
      observer: function(newval) {
        if(newval){
          this.setData({
            showPhone: newval
          })
        }
      }
    }
  },

  attached:function() {
    try {
      let phoneNumGet = storage.get('phoneNumGet')
      Loger(phoneNumGet)
      if (phoneNumGet=='showed') {
        this.setData({
          phoneNumGet:'showed'
        })
      }else{
        this.setData({
          phoneNumGet:'notShown'
        })
      }
    } catch (e) {
      this.setData({
        phoneNumGet:'notShown'
      })
      Loger('获取本地缓存失败')
    }
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    }else if(app.isFullScreen==undefined){
      let that=this
      setTimeout(function(){
        that.setData({
          butHigh: app.isFullScreen
        })
      },500)
    }

  },

  data: {
    textLeft: '',
    textRight: '',
    butHigh:false, //是否全面屏
    showPhone:false,
    phoneNumGet:'showed',
  },

  methods: {

    getPhoneNum:co.wrap(function*(e){
      console.log(e)
      if(_.isEmpty(e.detail.iv)||_.isEmpty(e.detail.encryptedData)){

      }else{

      }
      storage.put('phoneNumGet','showed')
      this.setData({
        phoneNumGet:'showed'
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
