// pages/package_feature/kousuan/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'

Page({

  data: {
    totalData:[],
    grade:['一年级','二年级','三年级','四年级','五年级','六年级'],
    textbook:['人教版教材','其他教'],
    gradeVal:'一年级',
    textbookVal:'人教版教材',
    pick_type:null,
    pickList:null,
    showAnimate:false,
    showBgAnimate:false,

    calculationList:[{
      url:'../resource_images/icon_smile.png',
      name:'纯口算'
    },{
      url:'../resource_images/icon_smile.png',
      name:'单位换算'
    },{
      url:'../resource_images/icon_smile.png',
      name:'竖式计算'
    },{
      url:'../resource_images/icon_smile.png',
      name:'脱式计算'
    }],
  },

  onLoad: function (options) {

  },

  showPicker:function(e){
    let that=this
    if(this.data.pick_type==e.currentTarget.dataset.type){
      this.hidePicker()
    }else{ 
      if(this.data.pick_type){
        this.setData({
          showAnimate:false
        })
        setTimeout(function(){
          that.setData({
            showAnimate:true,
          })
        },100)
      }else{
        setTimeout(function(){
          that.setData({
            showAnimate:true,
            showBgAnimate:true,
          })
        },50)

      }
      this.setData({
        pick_type:e.currentTarget.dataset.type,
        pickList:this.data[e.currentTarget.dataset.type],
      })


    }
  },

  hidePicker:function(){
    let that=this
    this.setData({
      showAnimate:false,
      showBgAnimate:true,
    })
    setTimeout(function(){
      that.setData({
        pick_type:null
      })
    },100)
  },

  checkPicker:function(e){
    let pickVal=`${this.data.pick_type=='grade'?'gradeVal':'textbookVal'}`
    this.setData({
      [pickVal]:e.currentTarget.dataset.val
    })
  },

  toPlan:function(){
    wxNav.navigateTo('/pages/package_feature/kousuan/learningplan')
  }

})
