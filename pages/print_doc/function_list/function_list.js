"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../utils/common_import'
import graphql from '../../../network/graphql_request'
Page({
  data: {
    supply_types: '',
    mediumRecommend: ''
  },
  onLoad: co.wrap(function*(options) {}),

  toNext: co.wrap(function*({ currentTarget: { id } }) {
    let type = id
    if (type == 'baiduPrint') {
      try {
        let res = yield graphql.getBaiduNetAuth()
        if (res.token.baiduTokenName) {
          wxNav.navigateTo('/pages/package_feature/baidu_print/choose/index', {
            type: 'doc',
            from: 'original'
          })
        } else {
          wxNav.navigateTo('/pages/print_doc/start_intro/start_intro', {
            type: type
          })
        }
      } catch (error) {
        util.showError(error)
      }
    } else {
      wxNav.navigateTo('/pages/print_doc/start/start')
    }
  }),

  otherPrint() {
    wxNav.navigateTo('/pages/print_doc/otherIndex/otherIndex')
  },

  onShareAppMessage: function() {
    return app.share
  },
})