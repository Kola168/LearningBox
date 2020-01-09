// pages/package_preschool/evaluationprint/printpreview.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import gql from '../../../network/graphql/preschool'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    printImgs:[],
    showIndex:0,
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.orderInfo=JSON.parse(decodeURIComponent(options.orderInfo))

    this.setData({
      printImgs:_.pluck(_.flatten(_.pluck(this.orderInfo,'contentImages')),'nameUrl')
    })
  },

  backImg:function(){
    if(this.data.showIndex<=0){
      this.data.showIndex=this.data.printImgs.length-1
    }else{
      this.data.showIndex--
    }
    this.setData({
      showIndex:this.data.showIndex
    })
  },

  nextImg:function(){
    if(this.data.showIndex>=(this.data.printImgs.length-1)){
      this.data.showIndex=0
    }else{
      this.data.showIndex++
    }
    this.setData({
      showIndex:this.data.showIndex
    })
  },

  setPrint:function(){
    wxNav.redirectTo('/pages/package_preschool/evaluationprint/printset',{
      type:this.orderInfo[0].featureKey,
      imgs:encodeURIComponent(JSON.stringify(this.data.printImgs))
    })
  }
})
