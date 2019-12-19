// pages/package_feature/print_stickerbook/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const upload = require('../../../utils/upload')
const imginit = require('../../../utils/imginit')
const event = require('../../../lib/event/event')

const showModal = util.promisify(wx.showModal)

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    templateList: [],
    templateInfo: {}, //传入组件的模板信息
    paperSize: {}, //传入组件的纸张信息
    templateIndex: 0, //选择的模板index
    templateTypeIndex: 0, //选择的模板种类index
    direction:'vertical',
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.mediaType=options.mediaType||'photo_sticker'
    this.imgInfo=JSON.parse(decodeURIComponent(options.imgInfo))
    this.direction=options.direction
    this.index=options.index
    this.getTemplateList()
  },
  getTemplateList:co.wrap(function*(){
    try{
      let resp=yield graphql.searchTemplate(this.mediaType)
      Loger(resp.feature.categories)
      this.data.mainTemplateList=_.where(resp.feature.categories,{isHorizontal: this.direction=='vertical'?"false":"true"})
      console.log(  this.data.mainTemplateList)
      this.setData({
        templateList:this.data.mainTemplateList
      })
      this.checkTemplateType(this.data.templateTypeIndex)
    }catch(e){
      console.log(e)
    }
  }),
  setComponentData:function(){
    let templateInfo=this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].positionInfo
    let modeSize={
      x: templateInfo.areaX,
      y: templateInfo.areaY,
      areaWidth: templateInfo.areaWidth,
      areaHeight: templateInfo.areaHeight,
    }
    this.setData({
      photoPath:this.imgInfo.localUrl,
      imageInfo:{
        width:this.imgInfo.imgInfo.width,
        height:this.imgInfo.imgInfo.height
      },
      paperSize:{
        width: Number(templateInfo.width),
        height: Number(templateInfo.height),
        minLeftHeight: 600,
        sider: 46,
      },
      templateInfo:{
        modeSrc: this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].imageUrl,
        modeSize: modeSize
      }
    })
  },

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
    this.setComponentData()
  },

  confBut:co.wrap(function*(){
    try {
      this.longToast.toast({
        type: "loading",
      })
      let params = this.selectComponent("#mymulti").getImgPoint()[0] //页面调用组件内方法
      let param = {
        is_async: false,
        editor_scale: params.editor_scale,
        image_url: params.image_url,
        feature_key: this.mediaType,
        rotate: params.rotate,
        scale: params.scale,
        x: params.x,
        y: params.y,
        image_width: params.image_width,
        image_height: params.image_height,
        step_method:'one',
        template_sn:this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].sn
      }
      const resp = yield api.processes(param)
      event.emit('setPreData', {
        url: resp.res.url,
        index: this.index ,
        direction:this.direction
      })
      wxNav.navigateBack()
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      wx.showModal({
        title: '合成出错',
        content: '请检查网络连接',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
      Loger(e)
    }
  }),

})
