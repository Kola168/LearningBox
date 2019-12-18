// pages/package_feature/print_balloon/typelist.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    ballList: []
  },

  onLoad: function (options) {
    this.type=options.type||'balloon'
    this.getTypeList()
  },

  getTypeList:co.wrap(function*(){
    let typeList=yield graphql.getCategory(this.type)
    Loger(typeList.feature.categories)
    this.setData({
      ballList:typeList.feature.categories
    })
  }),

  checkType:function(e){
    wxNav.navigateTo('/pages/package_feature/print_balloon/edit',{
      id:e.currentTarget.dataset.id,
      type:this.type,
      name:e.currentTarget.dataset.name
    })
  },

})
