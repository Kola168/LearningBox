// pages/print_photo/edit.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const _ = require('../../lib/underscore/we-underscore')
const util = require('../../utils/util')
const event = require('../../lib/event/event')

const request = util.promisify(wx.request)

import wxNav from '../../utils/nav.js'
import api from '../../network/restful_request'
import gql from '../../network/graphql_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    templateInfo: [],
    paperSize: {},
    photoPath: '',
    showMode: false,
    templateList: [], //模板列表
    templateTypeIndex: 0, // 模板主题index
    templateIndex: 0, //模板index

  },

  onLoad: function(options) {
    Loger(options)
    this.longToast = new app.weToast()
    this.imgInfo = JSON.parse(decodeURIComponent(options.imgInfo))

    this.index = options.index
    this.mediaInfo = JSON.parse(decodeURIComponent(options.photoMedia))
    this.mediaType = options.mediaType
    this.setData({
      showMode: JSON.parse(options.showMode)
    })
    if (this.data.showMode) {
      this.getTemplateList()
    } else {
      this.setData({
        photoPath: this.imgInfo.localUrl,
        imageInfo:{
          width:this.imgInfo.width,
          height:this.imgInfo.height
        },
        paperSize: {
          width: this.mediaInfo.width,
          height: this.mediaInfo.height,
          minLeftHeight: 260,
          sider: 220,
        },
        templateInfo: {
          modeSize: {
            x: 0,
            y: 0,
            width: this.mediaInfo.width,
            height: this.mediaInfo.height,
            areaWidth: this.mediaInfo.width,
            areaHeight: this.mediaInfo.height,
          }
        }
      })
    }
  },

  getTemplateList: co.wrap(function*() {
    this.longToast.toast({
      type: "loading",
    })
    try {
      let templateList = yield gql.searchTemplate(this.mediaType)
      Loger(templateList.feature.categories)
      if (templateList.errors) {
        this.longToast.toast()
        return wx.showModal({
          title: '网络异常',
          content: '请检查网络连接',
          showCancel: false,
          confirmColor: '#FFE27A',
          success: function() {
            wxNav.navigateBack()
          }
        })
      }
      this.setData({
        templateList: templateList.feature.categories
      })
    } catch (e) {
      Loger(e)
      this.longToast.toast()
      wx.showModal({
        title: '网络异常',
        content: '请检查网络连接',
        showCancel: false,
        confirmColor: '#FFE27A',
        success: function() {
          wxNav.navigateBack()
        }
      })
    }
    this.checkTemplateType(0)
    this.longToast.toast()
  }),

  setComponentData: function() {
    try{
      let templateInfo = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].positionInfo
      let modeSize = {
        x: templateInfo.areaX,
        y: templateInfo.areaY,
        areaWidth: templateInfo.areaWidth,
        areaHeight: templateInfo.areaHeight,
      }
      this.setData({
        photoPath: this.imgInfo.localUrl,
        imageInfo:{
          width:this.imgInfo.width,
          height:this.imgInfo.height
        },
        paperSize: {
          width: Number(templateInfo.width),
          height: Number(templateInfo.height),
          minLeftHeight: 610,
          sider: 220,
        },
        templateInfo: {
          modeSrc: this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].imageUrl,
          modeSize: modeSize
        }
      })
      this.longToast.toast()
    }catch(e){
      Loger(e)
      this.longToast.toast()
      wx.showModal({
        title: '提示',
        content: '模板加载异常',
        showCancel: false,
        confirmColor: '#FFE27A',
        success: function() {
          wxNav.navigateBack()
        }
      })
    }
  },

  checkTemplateType: function(e) {
    let index = e.currentTarget ? e.currentTarget.dataset.index : e
    this.setData({
      templateTypeIndex: index
    })

    this.checkTemplate(0)
  },

  checkTemplate: function(e) {
    let index = e.currentTarget ? e.currentTarget.dataset.index : e
    this.setData({
      templateIndex: index
    })

    this.setComponentData()
  },

  confEdit: co.wrap(function*() {
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
        image_height: params.image_height
      }
      if (this.data.showMode) {
        param.template_sn = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].sn
      }
      const resp = yield api.processes(param)
      event.emit('setPreData', { url: resp.res.url, index: this.index })
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
