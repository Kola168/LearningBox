// pages/package_feature/kousuan/pointslist.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const event = require('../../../lib/event/event')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql/feature'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    title:'口算',
    pointsList:[{
      name:'十以内的加法',
      src:'../resource_images/icon_smile.png',
    },{
      name:'十以内的减法',
      src:'../resource_images/icon_smile.png',
    }],
    addNum:20,  //单次点击增减数量
    totalTapNum:5, //总点击次数为五次
    nowTap:0,  //当前点击次数
  },

  onLoad: function (options) {
    this.sn=options.sn
    this.setData({
      title:options.title
    })
    this.longToast = new app.weToast()
    this.getKnowledgeList()
    event.on('webViewData', this, (postData) => {
      this.checkWebViewData(postData)
    })
  },

  onUnload: function() {
    event.remove('webViewData', this)
  },

  getKnowledgeList:co.wrap(function*(){
    try{
      this.longToast.toast({
        type:'loading'
      })
      let resp=yield graphql.getKnowledgePoints(this.sn)
      this.setData({
        pointsList:resp.category.children
      })
      this.initTapNum()
      this.longToast.toast()
    }catch(e){
      console.log(e)
      util.showError(e)
    }
  }),

  //初始化各项点击次数
  initTapNum:function(){
    _.map(this.data.pointsList,function(val){
      return _.extend(val,{tapNum:0})
    })
    this.setData({
      pointsList:this.data.pointsList
    })
  },

  decreaseNum:function(e){
    let index=e.currentTarget.dataset.index
    if(this.data.pointsList[index].tapNum<=0||this.data.nowTap<=0){
      return
    }
    this.data.pointsList[index].tapNum--
    this.data.nowTap--
    this.setData({
      [`pointsList[${index}]`]:this.data.pointsList[index],
      nowTap:this.data.nowTap
    })
  },

  increaseNum:function(e){
    let index=e.currentTarget.dataset.index
    if(this.data.nowTap>=this.data.totalTapNum){
      return
    }
    this.data.pointsList[index].tapNum++
    this.data.nowTap++
    this.setData({
      [`pointsList[${index}]`]:this.data.pointsList[index],
      nowTap:this.data.nowTap
    })
  },

  confBut:function(){
    wxNav.navigateTo('/pages/package_feature/kousuan/previewWebview')
  },

  checkWebViewData:function(val){
    console.log(val)
  },
})
