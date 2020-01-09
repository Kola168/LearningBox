// pages/package_feature/kousuan/learningplan.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql/feature'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    planTypeCheck:'processing',
    stateList:[],
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.getTimeList()
  },

  getTimeList:co.wrap(function*(){
    this.longToast.toast({
      type:'loading'
    })
    try{
      let resp=yield graphql.timedTasks({
        state:this.data.planTypeCheck,
        taskType:'kousuan'
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
      this.longToast.toast()
    }catch(e){
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }
  }),

  checkPlanType:function(e){
    let type=e.currentTarget.dataset.type
    this.setData({
      planTypeCheck:type
    })
    this.this.getTimeList()
  },

  createPlan:function(){
    wxNav.navigateTo('/pages/package_feature/kousuan/createplan')
  },

})
