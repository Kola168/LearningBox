// pages/package_feature/print_link/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql_request'
import commonRequest from '../../../utils/common_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    linkVal:'',
    linkHead:['https://mp.weixin.qq.com','baidu.com','https://article.xuexi.cn/'],
  },

  onLoad: function (options) {

  },

  checkLink:co.wrap(function*(){

  }),

  bindTips:function(){
    wxNav.navigateTo('pages/package_feature/print_link/typeList')
  },

})
