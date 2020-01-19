// pages/account/collection/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql/common'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    collectionList: [],
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.onPullDownRefresh()
  },

  page: 1,
  stopPulldown: false,

  loadList: co.wrap(function*() {
    if(this.stopPulldown){
      return
    }
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield graphql.collections({
        type: "content",
        page: this.page
      })
      Loger(resp)
      if (resp.collections.length > 0) {
        this.setData({
          collectionList: this.data.collectionList.concat(resp.collections)
        })
      } else {
        this.stopPulldown = true
      }

      this.longToast.toast()
    } catch (e) {
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }
  }),

  toContent:function(e){
    let index = e.currentTarget.dataset.index
    wxNav.navigateTo(this.data.collectionList[index].redirectPath)
  },

  backIndex:function(){
    wxNav.switchTab('/pages/index/index')
  },

  onPullDownRefresh: function() {
    this.page = 1
    this.stopPulldown = false
    this.loadList()
  },

  onReachBottom: function() {
    this.page += 1
    this.loadList()
  },
})
