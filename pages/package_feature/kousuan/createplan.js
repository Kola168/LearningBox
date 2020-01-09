// pages/package_feature/kousuan/createplan.js
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
    textBookList:[],
    calculationList:[],
    gradeIndex:0,  //年级index
    textbookIndex:0,  // 教科书index
    pick_type:'',  //顶部导航栏选择样式
    pickList:[],//下拉列表数组
    showAnimate:false, //顶部下拉框动画
    showBgAnimate:false, //顶部背景动画

    ksTypeIndex:0,  //口算类型index
    pointIndex:0, //知识点类型index
    pointType:'',  //联系想与知识点选择样式

    hours:_.map(_.range(24),function(num){return num>=10?num:('0'+num)}),  //时间的小时
    minutes:_.map(_.range(60),function(num){return num>=10?num:('0'+num)}), //时间的分钟
    checkedHourIndex:20,
    checkedMinutesIndex:0,
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
        textBookList:resp.userStages.siblings,
        gradeIndex:_.findIndex(resp.userStages.siblings,resp.userStages.currentStage)
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
      let resp=yield graphql.getKousuanTypeAndChildren(this.data.textBookList[this.data.gradeIndex].kousuanCategories[this.data.textbookIndex].sn)
      Loger(resp)
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
    let type=e.currentTarget.dataset.type
    this.setData({
      pick_type:type,
      pointType:'',
    })
  },

  //选择年级或教科书列表
  checkPicker:function(e){
    let index=e.currentTarget.dataset.index
    let checkedIndex=this.data.pick_type=='grade'?'gradeIndex':'textbookIndex'
    if(this.data[checkedIndex]==index){
      return this.hidePicker()
    }
    this.setData({
      [checkedIndex]:index,
    })

  },

  //隐藏年级教科书栏下拉列表
  hidePicker:function(){
    let that=this
    that.setData({
      pick_type:null
    })
    this.getPointsList()
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
      pick_type:null
    })
  },

  //点击练习项分类
  tapPractice:function(e){
    let index=e.currentTarget.dataset.index
    if(this.data.ksTypeIndex==index){
      this.hidePointsScroll()
    }
    this.setData({
      ksTypeIndex:index
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

  closeAll:function(){
    this.setData({
      pointType:'',
      pick_type:null,
    })
  },

  bindChange:function(e){
    let indexArr=e.detail.value
    this.setData({
      checkedHourIndex:indexArr[0],
      checkedMinutesIndex:indexArr[1]
    })
  },

  setTime:co.wrap(function*(){
    if(_.isEmpty(this.data.calculationList)||_.isEmpty(this.data.calculationList[this.data.ksTypeIndex].children)||_.isEmpty(this.data.calculationList[this.data.ksTypeIndex].children[this.data.pointIndex].sn)){
      return wx.showToast({
        title:'还未选择知识点哦',
        duration:2000,
        icon:'none',
        mask:true
      })
    }
    this.longToast.toast({
      type:'loading'
    })
    try{
      let resp=yield graphql.createTimedtask({
        sn:this.data.calculationList[this.data.ksTypeIndex].children[this.data.pointIndex].sn,
        title:"七天专项练习",
        taskType: "kousuan",
        day:7,
        resource:"kousuan_category",
      })
      wxNav.redirectTo('/pages/package_feature/kousuan/createTime',{
        sn:resp.createTimedtask.task.sn
      })
      this.longToast.toast()
    }catch(e){
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }
  }),

})
