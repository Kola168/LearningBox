// pages/package_feature/kousuan/pointslist.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'

Page({

  data: {
    title:'纯口算',
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
    this.initTapNum()
  },

  //初始化各项点击次数
  initTapNum:function(){
    _.map(this.data.pointsList,function(val){
      return _.extend(val,{tapNum:1})
    })
    this.setData({
      pointsList:this.data.pointsList
    })
  },

  decreaseNum:function(e){
    let index=e.currentTarget.dataset.index
  },

  increaseNum:function(e){
    let index=e.currentTarget.dataset.index
  },

  confBut:function(){
    wxNav.navigateTo('/pages/package_feature/kousuan/previewWebview')
  },

})
