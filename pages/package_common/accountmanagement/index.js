// pages/package_common/accountmanagement/index.js
const app = getApp()

import {
  regeneratorRuntime,
  co,
  util,
  _,
  uploadFormId,
  common_util
} from '../../../utils/common_import'

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql_request'

Page({

  data: {
    baidName:'',
  },

  onLoad:function(){
    this.longToast = new app.weToast()
    this.checkBaidu()
  },

  checkBaidu:co.wrap(function*(){
    this.longToast.toast({
      type:'loading'
    })
    try {
      const resp = yield graphql.checkBaiduAuth()
      this.setData({
        baidName: resp.token.baiduTokenName,
      })
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      this.selectComponent("#modal").showModal({
        title: '绑定账号',
        content: '你还没有绑定百度账号哦',
        cancelText: '取消',
        confirmText: '去绑定',
        confirmBg: '#FFDC5E;'
      })
    }
  }),

  showModal:function(){
    this.selectComponent("#modal").showModal({
      title: '切换账号',
      content: '确认切换账号吗？每日重新登陆次数有限，请谨慎操作',
      cancelText: '取消',
      confirmText: '确认',
      confirmBg: '#FFDC5E;'
    })
  },

  modelConfirm:function(){
    wxNav.navigateTo('/pages/print_doc/start_intro/start_intro', {
      type: 'baiduPrint'
    })
  },

})
