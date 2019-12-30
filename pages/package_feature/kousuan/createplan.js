// pages/package_feature/kousuan/createplan.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'

Page({

  data: {
    //年级和教材列表
    textBookList:[
      {
      grade:'一年级',
      list:[{
        textboox:'人教版'
      },{
        textboox:'苏教版'
      }]
    },{
      grade:'二年级',
      list:[{
        textboox:'人教版'
      },{
        textboox:'苏教版'
      }]
    },{
      grade:'三年级',
      list:[{
        textboox:'人教版'
      },{
        textboox:'苏教版'
      }]
    },{
      grade:'四年级',
      list:[{
        textboox:'人教版'
      },{
        textboox:'苏教版'
      }]
    }],
    knowledgeList:[
      {
      typeName:'纯口算',
      points:[{
        name:'十以内加减法',
        img:'../resource_images/album_top.png'
      },
      {
        name:'十以内加法',
        img:'../resource_images/album_top.png'
      },
      {
        name:'十以内减法',
        img:'../resource_images/album_top.png'
      }]
    },{
      typeName:'单位换算',
      points:[{
        name:'千克',
        img:'../resource_images/album_top.png'
      },
      {
        name:'磅',
        img:'../resource_images/album_top.png'
      },
      {
        name:'千',
        img:'../resource_images/album_top.png'
      },
      {
        name:'十',
        img:'../resource_images/album_top.png'
      }]
    },{
      typeName:'竖式运算',
      points:[{
        name:'1',
        img:'../resource_images/album_top.png'
      },
      {
        name:'2',
        img:'../resource_images/album_top.png'
      },
      {
        name:'3',
        img:'../resource_images/album_top.png'
      }]
    },,{
      typeName:'其他计算',
      points:[{
        name:'1',
        img:'../resource_images/album_top.png'
      },
      {
        name:'2',
        img:'../resource_images/album_top.png'
      },
      {
        name:'3',
        img:'../resource_images/album_top.png'
      }]
    }],
    gradeIndex:0,  //年级index
    textbookIndex:0,  // 教科书index
    pick_type:'',  //顶部导航栏选择样式
    pickList:[],//下拉列表数组
    showAnimate:false, //顶部下拉框动画
    showBgAnimate:false, //顶部背景动画

    ksTypeIndex:0,  //口算类型index
    pointIndex:0, //知识点类型index
    pointType:'',  //联系想与知识点选择样式
    pointPickList:[],
    tipTime:'20:00',

    huors:_.range(24),  //时间的小时
    minutes:_.range(60) //时间的分钟
  },

  onLoad: function (options) {

  },
  showPicker:function(e){
    let that=this
    let type=e.currentTarget.dataset.type
    if(this.data.pick_type==type){
      this.hidePicker()
    }else{
      if(type=='grade'){
        this.data.pickList=_.pluck(this.data.textBookList,'grade')
      }else{
        this.data.pickList=_.pluck(this.data.textBookList[this.data.gradeIndex].list,'textboox')
      }
      this.setData({
        pickList:this.data.pickList,
      })
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
        pick_type:type,
      })
    }
  },


  //选择年级或教科书列表
  checkPicker:function(e){
    let index=e.currentTarget.dataset.index
    let checkedIndex=this.data.pick_type=='grade'?'gradeIndex':'textbookIndex'
    if(this.data[checkedIndex]==index){
      this.hidePicker()
    }
    this.setData({
      [checkedIndex]:index
    })
  },

  //隐藏年级教科书栏下拉列表
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
  },

  //显示联系想or知识点列表
  checkPoints:function(e){
    let type=e.currentTarget.dataset.type
    if(type==this.data.pointType){
      this.hidePointsScroll()
      return
    }
    if(type=='practice'){
      this.data.pointPickList=_.pluck(this.data.knowledgeList,'typeName')
    }else if(type=='knowledge'){
      this.data.pointPickList=_.pluck(this.data.knowledgeList[this.data.ksTypeIndex].points,'name')
    }else{
      this.data.pointPickList=null
    }
    this.setData({
      pointType:type,
      pointPickList:this.data.pointPickList
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
      pointPickList:''
    })
  },

  preventTap:function(){
    return false
  }
})
