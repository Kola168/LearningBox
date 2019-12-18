// pages/package_feature/print_balloon/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql_request'
import api from '../../../network/restful_request'
import commonRequest from '../../../utils/common_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    templateList: [], // 模板列表
    selectedIndex:0,  //选中的模板的index
    confirmModal: {},
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.id = options.id
    this.name=options.name
    this.type=options.type||'balloon'
    this.getTemplate()
  },

  getTemplate:co.wrap(function*(){
    try{


    let resp=yield graphql.searchTemplateType(this.id)
    Loger(resp.category)
    this.setData({
      templateList:resp.category.templates
    })
    this.tapTemplate(0)
  }catch(e){
    Loger(e)
  }
  }),

  chooseTemplate:function(index){
    this.setData({
      paperSize: {
        width: this.data.templateList[index].positionInfo.width,
        height: this.data.templateList[index].positionInfo.height,
        heightPer: 0.666,
        minLeftHeight: 385,
        sider: 220,
      },
      templateInfo: {
        modeSrc:this.data.templateList[index].imageUrl,
        modeSize: {
          x: this.data.templateList[index].positionInfo.areaX,
          y: this.data.templateList[index].positionInfo.areaY,
          width: this.data.templateList[index].positionInfo.width,
          height: this.data.templateList[index].positionInfo.height,
          areaWidth: this.data.templateList[index].positionInfo.areaWidth,
          areaHeight: this.data.templateList[index].positionInfo.areaHeight,
        }
      }
    })
  },

  tapTemplate:function(e){
    let index=e.currentTarget?e.currentTarget.dataset.index:e
    Loger(index)
    this.setData({
      selectedIndex:index
    })
    this.chooseTemplate(index)
  },

  confBut:function(){
    this.setData({
      confirmModal: {
        isShow: true,
        title: '请将气球打印纸按照参照图正确放置',
        image: `https://cdn-h.gongfudou.com/LearningBox/feature/balloon/balloon_confirm_print_${this.name=='圆形气球'?'balloon':(this.name=='心形气球'?'heart':(this.name=='星形气球'?'star':''))}.png`
      },
    })
  },

  makeOrder:co.wrap(function*(){
    try {
      this.longToast.toast({
        type: "loading",
      })
      let params = this.selectComponent("#mymulti").getImgPoint()[0] //页面调用组件内方法
      let param = {
        is_async: false,
        editor_scale: params.editor_scale,
        image_url: params.image_url,
        feature_key: this.type,
        rotate: params.rotate,
        scale: params.scale,
        x: params.x,
        y: params.y,
        image_width: params.image_width,
        image_height: params.image_height
      }
      param.template_sn = this.data.templateList[this.data.selectedIndex].sn
      const resp = yield api.processes(param)

      let imgs=[{
        printUrl:resp.res.url,
        originalUrl:param.image_url
      }]
      let orderSn = yield commonRequest.createOrder(this.type, imgs)
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
      Loger(e)
    }
  }),

})
