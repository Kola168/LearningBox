// pages/package_feature/print_name/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql_request'

let Loger=(app.apiServer!='https://epbox.gongfudou.com'||app.deBug)?console.log:function(){}

Page({

  data: {
    templateList:[],
    templateTypeIndex:0,
    templateIndex:0,

    templateInfo:{},
    paperSize:{},
  },

  onLoad: function (options) {
    this.type=options.type||'name_sticker'

    this.longToast = new app.weToast()
    this.getTemplateList()
  },

  getTemplateList:co.wrap(function*(){
    try{
      let resp=yield graphql.searchNameTemplate(this.type)
      Loger(resp)
      this.setData({
        templateList:resp.feature.categories
      })
      this.checkTemplateType(this.data.templateTypeIndex)
    }catch(e){
      Loger(e)
      util.showError(e)
    }
  }),

  checkTemplateType:function(e){
    let index=e.currentTarget?e.currentTarget.dataset.index:e
    this.setData({
      templateTypeIndex:index
    })
    this.checkTemplate(0)
  },

  checkTemplate:function(e){
    let index=e.currentTarget?e.currentTarget.dataset.index:e
    this.setData({
      templateIndex:index
    })
    this.inputVal=Array(this.data.templateList[this.data.templateTypeIndex].attrsInfo.length).fill('')
    if(this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].uploadable){
      return
    }
    this.setComponentData()
  },

  setComponentData:function(){
    let templateItem=this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].positionInfo
    this.setData({
      templateInfo:{
        modeSrc:this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].imageUrl,
        modeSize:{
          x:templateItem.areaX,
          y:templateItem.areaY,
          areaWidth:templateItem.areaWidth,
          areaHeight:templateItem.areaHeight
        }
      },
      paperSize:{
        width:templateItem.width,
        height:templateItem.height,
        minLeftHeight:516,
        sider:150,
      }
    })
  },

  getTextAttr:function(e){
    console.log(e)
    let index=e.currentTarget.dataset.index
    this.inputVal[index]=e.detail.value
  },

  getParamsData:co.wrap(function*(){
    this.longToast.toast({
      type: "loading",
    })
    try{
      let params={}
      let templateItem=this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex]
      if(templateItem.uploadable){
        if(_.isEmpty(this.selectComponent("#mymulti").data.imgArr)){
          return wx.showModal({
            title: '提示',
            content: '请上传头像',
            showCancel: false,
            confirmColor: '#FFE27A'
          })
        }
        params=this.selectComponent("#mymulti").getImgPoint()[0]
      }
      console.log(this.data.templateList[this.data.templateTypeIndex].attrsInfo,this.inputVal)
      let inputVal=_.object(this.data.templateList[this.data.templateTypeIndex].attrsInfo,this.inputVal)
      params=_.extend(params,inputVal)
      params.template_sn=templateItem.sn
      params.feature_key=this.type
      console.log(params)
      const resp = yield api.processes(params)
      this.longToast.toast()
      wxNav.navigateTo('/pages/package_feature/print_name/preview',{
        imgSrc:encodeURIComponent(JSON.stringify(resp.res.url)),
        type:this.type,
        sn:resp.res.sn
      })
    }catch(e){
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }

  })
})
