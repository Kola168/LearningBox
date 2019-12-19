// pages/package_feature/print_postcard/edit.js
import wxNav from '../../../utils/nav.js'
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const imginit = require('../../../utils/imginit')

const showModal = util.promisify(wx.showModal)

import api from '../../../network/restful_request'
import gql from '../../../network/graphql_request'
import commonRequest from '../../../utils/common_request'

let Loger=(app.apiServer!='https://epbox.gongfudou.com'||app.deBug)?console.log:function(){}

Page({

  data: {
    templateList: [],
    templateInfo: {}, //传入组件的模板信息
    paperSize: {
      width: 1181,
      height: 1748,
      minLeftHeight: 510,
      sider: 46,
    }, //传入组件的纸张信息
    templateIndex: 0, //选择的模板index
    templateTypeIndex: 0, //选择的模板种类index
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.type=options.type||'postcard'
    this.getTemplateList()
  },

  getTemplateList:co.wrap(function*(){
    let templateList=yield gql.searchTemplate(this.type)
    Loger(templateList.feature.categories)
    this.setData({
      templateList:templateList.feature.categories
    })
    this.checkTemplateType(0)
  }),

  setComponentData: function() {
    let templateInfo = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].positionInfo
    let modeSize = {
      x: templateInfo.areaX,
      y: templateInfo.areaY,
      areaWidth: templateInfo.areaWidth,
      areaHeight: templateInfo.areaHeight,
    }
    this.setData({
      paperSize: {
        width: Number(templateInfo.width),
        height: Number(templateInfo.height),
        minLeftHeight: 510,
        sider: 46,
      },
      templateInfo: {
        modeSrc: this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].imageUrl,
        modeSize: modeSize
      }
    })
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

  confBut:co.wrap(function*(){
    if(this.selectComponent("#mymulti").data.imgArr.length==0){
      return wx.showModal({
        title: '提示',
        content: '至少上传一张照片哦',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
    }
    this.setData({
      confirmModal: {
        isShow: true,
        title: '请参照下图正确放置明信片打印纸',
        image: 'https://cdn-h.gongfudou.com/LearningBox/main/confirm_print.png'
      },
    })
  }),

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
      param.template_sn = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].sn
      const resp = yield api.processes(param)
      let imgs = [{
        originalUrl: param.image_url,
        printUrl: resp.res.url
      }]
      let orderSn = yield commonRequest.createOrder(this.type, imgs)
      wxNav.redirectTo(`/pages/finish/index`, {
        media_type: this.type
      })
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
      Loger(e)
    }
  }),
})
