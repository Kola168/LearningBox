// pages/error_book/pages/course/pay_success/pay_success.js
import {
  regeneratorRuntime,
  co,
  util
} from '../../../utils/common_import'
import link from './link'
Page({
  data: {
    btnList: null
  },
  onLoad: function (options) {
    var tag = options.tag
    var current = link[tag]
    if (tag) {
      current.initParams.call(current, options) // 初始化按钮组
      this.setData({
        btnList: current.btnList
      })
    }

  }
})