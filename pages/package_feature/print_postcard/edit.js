// pages/package_feature/print_postcard/edit.js
import wxNav from '../../../utils/nav.js'
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const imginit = require('../../../utils/imginit')

const showModal = util.promisify(wx.showModal)

import gql from '../../../network/graphql_request'

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
    this.type=options.type||'postcard'
    this.getTemplateList()
  },

  getTemplateList:co.wrap(function*(){
    let templateList=yield gql.searchTemplate(this.mediaType)
    Loger(templateList.feature.categories)
    this.setData({
      templateList:templateList.feature.categories
    })
    this.checkTemplateType(0)
  }),

  setComponentData: function() {
    let templateInfo = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].positionInfo
    let modeSize = {
      x: templateInfo.area_x,
      y: templateInfo.area_y,
      areaWidth: templateInfo.area_width,
      areaHeight: templateInfo.area_height,
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
})
