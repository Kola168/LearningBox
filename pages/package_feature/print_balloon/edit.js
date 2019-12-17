// pages/package_feature/print_balloon/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql_request'
import api from '../../../network/restful_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    templateList: [], // 模板列表
    selectedIndex:0,  //选中的模板的index
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.id = options.id
    this.type=options.type||'balloon'
    this.getTemplate()
  },

  getTemplate:co.wrap(function*(){
    let resp=yield graphql.searchTemplateType(this.id)
    Loger(resp.category)
    this.setData({
      templateList:resp.category.templates
    })
    this.tapTemplate(0)
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
