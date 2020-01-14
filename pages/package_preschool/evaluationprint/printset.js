// pages/package_preschool/evaluationprint/printset.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import gql from '../../../network/graphql/preschool'
import commonRequest from '../../../utils/common_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    printNum: 1,
    colorType: 'color',
    confirmModal: {},
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.imgs=JSON.parse(decodeURIComponent(options.imgs))
    this.type=options.type
  },

  decreaseNum: function() {
    if (this.data.printNum <= 1) {
      return
    }
    this.data.printNum--
    this.setData({
      printNum: this.data.printNum
    })
  },

  addNum: function() {
    if (this.data.printNum >= 99) {
      return
    }
    this.data.printNum++
    this.setData({
      printNum: this.data.printNum
    })
  },

  changeColor: function(e) {
    let type = e.currentTarget.dataset.type
    this.setData({
      colorType: type
    })
  },
  confBut:function(){

    this.setData({
      confirmModal: {
        isShow: true,
        title: '请正确放置A4打印纸',
  			image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
      },
    })

  },
  makeOrder:co.wrap(function*(){
    try {
      this.longToast.toast({
        type: "loading",
      })
      let that=this
      let imgs=[]
      _.each(this.imgs,function(value,index,list){
        imgs.push({
          printUrl:value,
          originalUrl:value,
          copies:that.data.printNum,
          color:that.data.colorType=='color'?true:false,
        })
      })
      let orderSn = yield commonRequest.createOrder(this.type, imgs)
      wxNav.navigateTo(`/pages/finish/index`, {
        media_type: 'baobeicepin',
        state:orderSn.createOrder.state
      })
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
      Loger(e)
    }
  }),
})
