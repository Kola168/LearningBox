// pages/package_feature/kousuan/createTime.js
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
    //年级和教材列表

    hours:_.map(_.range(24),function(num){return num>=10?num:('0'+num)}),  //时间的小时
    minutes:['00'],
    checkedHourIndex:20,
    checkedMinutesIndex:0,
  },

  onLoad: function (options) {
    this.sn=options.sn
    this.longToast = new app.weToast()
  },

  //显示联系想or知识点列表
  checkPoints:function(e){
    let type=e.currentTarget.dataset.type
    if(type==this.data.pointType){
      this.hidePointsScroll()
      return
    }

    this.setData({
      pointType:type,
    })
  },

  //点击知识点分类
  tapKnowledge:function(e){
    let index=e.currentTarget.dataset.index
    if(this.data.pointIndex==index){
      this.hidePointsScroll()
    }
    this.setData({
      pointIndex:index
    })
  },

  hidePointsScroll:function(){
    this.setData({
      pointType:'',
    })
  },

  preventTap:function(){
    return false
  },

  bindChange:function(e){
    let indexArr=e.detail.value
    this.setData({
      checkedHourIndex:indexArr[0],
      checkedMinutesIndex:indexArr[1]
    })
  },

  createPlan:co.wrap(function*(){

    this.longToast.toast({
      type:'loading'
    })
    try{
      let resp=yield graphql.joinSubscription({
        sn:this.sn,
        subscriptionResource:"timed_task",
        subscription:{
          copies:1,
          intervalDay:1,
          enable:true,
          timing:`${this.data.hours[this.data.checkedHourIndex]}:00`
        }
      })
      Loger(resp)
      if(resp.joinSubscription.state){
        wx.showToast({
          title:'练习计划创建成功',
          duration:2000,
          icon:'none',
          mask:true
        })
      }else{
        wx.showToast({
          title:'练习计划创建失败',
          duration:'2000',
          mask:true
        })
      }
      setTimeout(function(){
        wxNav.navigateBack()
      },2000)
      this.longToast.toast()
    }catch(e){
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }
  }),

})
