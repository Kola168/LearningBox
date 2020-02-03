// pages/package_feature/kousuan/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql/feature'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    textBookList:[],
    gradeIndex:0,
    textbookIndex:0,
    pick_type:null,
    pickList:null,
    showAnimate:false,
    showBgAnimate:false,

    calculationList:[],
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.getstageList()
  },

  getstageList:co.wrap(function*(){
    try{
      this.longToast.toast({
        type:'loading'
      })
      let resp=yield graphql.getGradeList()
      this.setData({
        textBookList:resp.primarySchoolStages,
        gradeIndex:0
      })
      this.getPointsList()
      this.longToast.toast()
    }catch(e){
      this.longToast.toast()
      Loger(e)
      util.showError(e)
    }
  }),

  getPointsList:co.wrap(function*(){
    if(!this.data.textBookList[this.data.gradeIndex].kousuanCategories[this.data.textbookIndex]){
      this.setData({
        calculationList:[]
      })
      return wx.showModal({
        title:'提示',
        content:'该年龄段暂无口算',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
    }
    try{
      this.longToast.toast({
        type:'loading'
      })
      let resp=yield graphql.getKousuanType(this.data.textBookList[this.data.gradeIndex].kousuanCategories[this.data.textbookIndex].sn)
      this.setData({
        calculationList:resp.category.children
      })
      this.longToast.toast()
    }catch(e){
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }
  }),

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
      if(e.currentTarget.dataset.type=='grade'){
        this.data.pickList=_.pluck(this.data.textBookList,'name')
      }else if(e.currentTarget.dataset.type=='textbook'){
        this.data.pickList=_.pluck(this.data.textBookList[this.data.gradeIndex].kousuanCategories,'name')
      }
      this.setData({
        pick_type:e.currentTarget.dataset.type,
        pickList:this.data.pickList,
      })
    }
  },

  hidePicker:function(){
    let that=this
    this.setData({
      showAnimate:false,
      showBgAnimate:false,
    })
    setTimeout(function(){
      that.setData({
        pick_type:null
      })
    },100)
    this.getPointsList()
  },

  checkPicker:function(e){
    let index=e.currentTarget.dataset.index
    if(this.data.pick_type=='grade'){
      if(index==this.data.gradeIndex){
        return this.hidePicker()
      }
      this.setData({
        gradeIndex:index,
        textbookIndex:0,
      })
    }else if(this.data.pick_type=='textbook'){
      if(index==this.data.textbookIndex){
        return this.hidePicker()
      }
      this.setData({
        textbookIndex:index,
      })
    }
  },

  checkType:function(e){
    let index=e.currentTarget.dataset.index
    wxNav.navigateTo('/pages/package_feature/kousuan/pointslist',{
      sn:this.data.calculationList[index].sn,
      title:this.data.calculationList[index].name
    })
  },

  linkTeacher:function(){
    wxNav.navigateTo('/pages/package_feature/kousuan/teacher')
  },

  toPlan:function(){
    wxNav.navigateTo('/pages/package_feature/kousuan/learningplan')
  }

})
