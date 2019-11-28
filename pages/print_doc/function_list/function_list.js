// pages/print_doc/index.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import api from '../../../network/api'
// import commonRequest from '../../utils/common_request.js'
import router from '../../../utils/nav'
Page({
    data: {
        supply_types: '',
        mediumRecommend: ''
    },
    onLoad: co.wrap(function* (options) {
      var media_type = '_docA4'
      this.setData({
        mediumRecommend: media_type
      })
      // commonRequest.getSupplyBefore(media_type).then( (res)=>{
      //   this.setData({
      //       supply_types: res.supply_types
      //   })
      // })
    }),

    toNext: co.wrap(function* ({currentTarget: {id}}) {
      let type = id
      if (type == 'baiduPrint') {
        try {
          var resp = yield api.checkBaiduAuth(app.openId)
          if (resp.code == 0) {
            router.navigateTo('/pages/error_book/pages/baidu_print/choose', {
              arrayFile: encodeURIComponent(JSON.stringify(res.tempFiles))
            })
            // wx.navigateTo({
            //     url: '../error_book/pages/baidu_print/choose?type=doclist'
            // })
          } else {
            router.navigateTo('/pages/error_book/pages/baidu_print/choose', {
              arrayFile: encodeURIComponent(JSON.stringify(res.tempFiles))
            })
            // wx.navigateTo({
            //     url: `../print_doc/start_intro?type=${type}`
            // })
          }
        } catch (error) {
            util.showErr(error)
        }
      } else {
        router.navigateTo('/pages/error_book/pages/baidu_print/choose')
        // wx.navigateTo({
        //     url: `../print_doc/start`
        // })
      }
    }),

    otherPrint() {
      router.navigateTo('/pages/print_doc/otherIndex/otherIndex')
    },

    onShareAppMessage: function () {
      return app.share
    },
})