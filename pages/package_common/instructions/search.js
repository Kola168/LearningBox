// pages/package_common/instructions/search.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql/common'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    inputVal:'',
    searchList:[{
      name:'盒子红灯一直闪烁是怎么回事？',
      link:'https://www.baidu.com',
    },{
      name:'打印机出纸太慢了？',
      link:'https://www.baidu.com',
    },{
      name:'打印机卡住了，不出纸了？',
      link:'https://www.baidu.com',
    }]
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.instructions()
  },

  inputChange:function(e){
    this.data.inputVal=e.detail.value
  },

  searchVal:co.wrap(function*(){
    if(!this.data.inputVal){
      return wx.showModal({
        title:'提示',
        content:'请输入内容',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
    }
    this.instructions()
  }),

  instructions:co.wrap(function*(){
    this.longToast.toast({
      type:'loading'
    })
    try{
      let resp = yield graphql.instructions({
        printerModelSn:'',
        keyword:this.data.inputVal,
        isGuesses:this.data.inputVal?false:true
      })
      this.setData({
        searchList:resp.instructions,
        inputVal:this.data.inputVal
      })
      this.longToast.toast()
    }catch(e){
      this.longToast.toast()
      Loger(e)
      util.showError(e)
    }
  }),
  toPreview:function(e){
    let index=e.currentTarget.dataset.index
      wxNav.navigateTo('/pages/webview/index',{
        url:`${app.apiServer}/mini_web/instructions/${this.data.searchList[index].sn}`
      })
  },

  feedback:function(){
    wxNav.navigateTo('/pages/package_common/feedback/index')
  },

  toKefu:function(){
    wxNav.navigateTo(`/pages/webview/index`,{
      url:encodeURIComponent(`https://gfd178.udesk.cn/im_client/?web_plugin_id=111131`)
    })
  },

  clearSearchVal:function(){
    this.setData({
      inputVal:''
    })
  },


})
