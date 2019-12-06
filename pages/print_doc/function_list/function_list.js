// pages/print_doc/index.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql_request'
import router from '../../../utils/nav'
Page({
    data: {
        supply_types: '',
        mediumRecommend: ''
    },
    onLoad: co.wrap(function* (options) {
    }),

    toNext: co.wrap(function* ({currentTarget: {id}}) {
      let type = id
      if (type == 'baiduPrint') {
        try {
          let res = yield graphql.getBaiduNetAuth()
          if (res.baiduTokenName) {
            router.navigateTo('/pages/error_book/pages/baidu_print/choose', {
              arrayFile: encodeURIComponent(JSON.stringify(res.tempFiles))
            })
          } else {
            router.navigateTo('/pages/print_doc/start_intro/start_intro', {
              type: type
            })
          }
        } catch (error) {
            util.showError(error)
        }
      } else {
        router.navigateTo('/pages/print_doc/start/start')
      }
    }),

    otherPrint() {
      router.navigateTo('/pages/print_doc/otherIndex/otherIndex')
    },

    onShareAppMessage: function () {
      return app.share
    },
})