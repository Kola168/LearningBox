// pages/finish/sourcefinish.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const _ = require('../../lib/underscore/we-underscore')
const feature_route = require('../../utils/feature_index')

const downloadFile = util.promisify(wx.downloadFile)

import wxNav from '../../utils/nav.js'
import storage from '../../utils/storage.js'
import gql from '../../network/graphql_request'
import commonRequest from '../../utils/common_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({
  data: {
    owner: false,
    audit_free: false,
    state: '',
    supply_types: '',
    // subscribe: false,
    describe: false,
    openId: '',
    activeDevice: null,
    showAdvertisement: true,
    studyDay: 0,
    dayUnit:'天',
    save:false,
    studyNum:null,
    studyUnit:null,
    continueText:'继续打印'
  },
  media_type: '',
  //  wxNav.navigateTo(`pages/finish/sourcefinish`, {
    //必传
    //    media_type: this.mediaType,
    //    state:resp.createOrder.state
    //    day:1   //学习天数
    //可选
    //    infoArr:[{
    //      label:'',单位
    //      value:''值
    //    }]  //传过来的天数及其他信息数组
    //    save:true    //是否保存朋友圈，没这功能不用传这字段
    //    studyNum:1  //学习的单位数量
    //    studyUnit:Unit  //单位
    //    continueText:'继续打印'  //继续打印的文案可不传
    // })
  onLoad: function(options) {
    this.longToast = new app.weToast()
    Loger('options=======', options)
    Loger(options.media_type)
    this.media_type = options.media_type
    if(_.isNotEmpty(options.studyNum)&&_.isNotEmpty(options.studyUnit)){
      this.setData({
        studyNum:options.studyNum,
        studyUnit:options.studyUnit
      })
    }
    this.setData({
      save:options.save,
      studyDay:options.day,
      continueText:options.continueText||'继续打印'
    })
    if(_.isNotEmpty(options.infoArr)){
      if(options.infoArr[0]){
        this.setData({
          studyDay:options.infoArr[0].value,
          dayUnit:options.infoArr[0].label,
        })
      }
      if(options.infoArr[1]){
        this.setData({
          studyNum:options.infoArr[1].value,
          studyUnit:options.infoArr[1].label,
        })
      }
    }

    this.setData({
      state: options.state
    })
    if (options.media_type) {
      wx.removeStorageSync(options.media_type)
    }
  },

  onShow() {
    this.setData({
      activeDevice: app.activeDevice
    })
  },

  localSave: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading'
    })
    let that = this
    try {
      let context = wx.createCanvasContext('myCanvas')
      let imgDunload = yield downloadFile({ url: 'https://cdn-h.gongfudou.com/LearningBox/main/finish_course_date.jpg' })
      context.drawImage(imgDunload.tempFilePath, 0, 0)
      context.setFillStyle('#ff9839')
      context.setTextAlign('right')
      context.setTextBaseline('top')
      if(_.isNotEmpty(this.data.studyNum)&&_.isNotEmpty(this.data.studyUnit)){
        context.setFontSize(70)
        context.fillText(this.data.studyDay, 213, 250)
        context.fillText(this.data.studyNum, 572, 250)
        context.setFontSize(28)
        context.fillText('天', 246, 285)
        context.fillText(this.data.studyUnit, 636, 285)
        context.setFontSize(40)
        context.fillText('|', 352, 261)
      }else{
        context.setFontSize(70)
        context.fillText(this.data.studyDay, 342, 250)
        context.setFontSize(28)
        context.fillText(this.data.dayUnit, 405, 285)
      }

      context.draw(false, function() {
        wx.canvasToTempFilePath({
          canvasId: 'myCanvas',
          success(res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath
            })
            that.longToast.toast()
          }
        })
      })
    } catch (e) {
      Loger(e)
    }

  }),
  checkScope: function(tips) {
    let scope = 'scope.writePhotosAlbum'
    let that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting[scope]) {
          that.localSave()
        } else {
          wx.authorize({
            scope: scope,
            success() {
              console.log('授权成功')
              that.localSave()
            },
            fail() {
              console.log(`authorize ${scope} fail==========!`)
              wx.showModal({
                title: '提示',
                content: '需要授权保存相册才能正常使用',
                success: function(res) {
                  if (res.confirm) {
                    wx.openSetting()
                  }
                }
              })
            }
          })
        }
      }
    })
  },

  backToHome: function() {
    wxNav.switchTab('/pages/index/index')
  },

  continuePrint: function() {
    wxNav.backPage(feature_route.feature_route[this.media_type])
  },

  onShareAppMessage: function() {
    return app.share
  },

  toDetail: function() {
    this.setData({
      describe: !this.data.describe
    })
  },

  order: function(e) {
    let id = e.currentTarget.id
    let alias = this.data.supply_types[id].alias
  },

})
