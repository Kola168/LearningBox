// pages/package_feature/print_ calendar/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const upload = require('../../../utils/upload')
const imginit = require('../../../utils/imginit')

const showModal = util.promisify(wx.showModal)

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    titleName: '',
    mainTemplateList: {},
    templateInfo: {}, //传入组件的模板信息
    paperSize: {}, //传入组件的纸张信息
    templateList: [], //模板数组
    direction: 'horizontal', //模板方向
    templateIndex: 0, //选择的模板index
    templateTypeIndex: 0, //选择的模板种类index
    type: '',
  },
  name: {
    diy_calendar: '制作DIY台历',
    wood_calendar: '制作木框台历',
  },
  storageEditData: {
    horizontal: [],
    vertical: [],
  },

  onLoad: function(options) {
    this.setData({
      titleName: this.name[options.type],
      type: options.type
    })
    this.getTemplateList()
  },

  getTemplateList:co.wrap(function*(){
    let resp=yield graphql.searchTemplate(this.data.type)
    Loger(resp.feature.categories)
    this.data.mainTemplateList.vertical=_.where(resp.feature.categories,{isHorizontal: "false"})
    this.data.mainTemplateList.horizontal=_.where(resp.feature.categories,{isHorizontal: "true"})
    this.setData({
      templateList:this.data.mainTemplateList
    })
    this.checkdirection('horizontal')
  }),

  checkTemplateDirection: function() {
    let templateList = []
    if (_.isEmpty(this.storageEditData[this.data.direction])) {
      templateList = this.data.mainTemplateList[this.data.direction]
      this.storageEditData[this.data.direction] = _.clone(templateList)
    } else {
      templateList = this.storageEditData[this.data.direction]
    }
    this.setData({
      templateList: templateList,
      templateIndex: 0,
      templateTypeIndex: 0,
    })
  },

  setModeData: function() {

    let checkedTemplate = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex]
    console.log(checkedTemplate)
    let modeSize = []
    if (checkedTemplate.area_info) {
      _.each(checkedTemplate.area_info, function(value, index, list) {
        modeSize.push({
          x: value.area_x,
          y: value.area_y,
          areaWidth: value.area_width,
          areaHeight: value.area_height,
        })
      })
    } else {
      modeSize.push({
        x: checkedTemplate.area_x,
        y: checkedTemplate.area_y,
        areaWidth: checkedTemplate.area_width,
        areaHeight: checkedTemplate.area_height,
      })
    }
    this.setData({
      paperSize: {
        width: Number(checkedTemplate.width),
        height: Number(checkedTemplate.height),
        minLeftHeight: 640,
        sider: 64,
      },
      templateInfo: {
        modeSrc: checkedTemplate.img_url,
        modeSize: modeSize
      }
    })
    this.selectComponent("#mymulti").setData({
      imgArr: []
    })
  },

  checkModeStorage: function() {
    let storage = {}
    storage.storageImgArr = _.deepClone(this.selectComponent("#mymulti").data.imgArr)
    storage.storageAreaSize = _.deepClone(this.selectComponent("#mymulti").data.areaSize)
    storage.storageEditAreaSize = _.deepClone(this.selectComponent("#mymulti").data.editAreaSize)
    storage.storageTemplateSrc = _.deepClone(this.selectComponent("#mymulti").data.TemplateSrc)
    storage.id = this.storageEditData[this.preDirection][this.preTemplateTypeIndex].templates[this.preTemplateIndex].id
    if (_.isNotEmpty(storage.storageImgArr) && _.isNotEmpty(storage.storageAreaSize) && _.isNotEmpty(storage.storageEditAreaSize)) {
      this.storageEditData[this.preDirection][this.preTemplateTypeIndex].templates[this.preTemplateIndex].storage = storage
      this.preDirection = this.data.direction
      this.preTemplateTypeIndex = this.data.templateTypeIndex
      this.preTemplateIndex = this.data.templateIndex
    }
    let checkedStorage = this.storageEditData[this.data.direction][this.data.templateTypeIndex].templates[this.data.templateIndex].storage
    console.log(this.storageEditData)
    if (_.isNotEmpty(checkedStorage)) {
      this.selectComponent("#mymulti").setData({
        imgArr: checkedStorage.storageImgArr,
        areaSize: checkedStorage.storageAreaSize,
        editAreaSize: checkedStorage.storageEditAreaSize,
        TemplateSrc: checkedStorage.storageTemplateSrc
      })
      this.preDirection = this.data.direction
      this.preTemplateTypeIndex = this.data.templateTypeIndex
      this.preTemplateIndex = this.data.templateIndex
    } else {
      this.setModeData()
    }
  },

  checkTemplateType: function(e) {
    let index = e.currentTarget.dataset.index
    this.preTemplateTypeIndex = _.clone(this.data.templateTypeIndex)
    this.setData({
      templateTypeIndex: index,
    })
    this.checkTemplate(0)
  },

  checkTemplate: function(e) {
    let index = e.currentTarget ? e.currentTarget.dataset.index : e
    this.preTemplateIndex = _.clone(this.data.templateIndex)
    this.setData({
      templateIndex: index,
    })

    this.checkModeStorage()
  },

  checkdirection: function(e) {
    let direction = e.currentTarget ? e.currentTarget.dataset.type : e
    this.preDirection = _.clone(this.data.direction)
    this.preTemplateIndex = _.clone(this.data.templateIndex)
    this.preTemplateTypeIndex = _.clone(this.data.templateTypeIndex)
    this.setData({
      direction: direction
    })
    this.checkTemplateDirection()
    this.checkModeStorage()
  },

  confBut: function() {
    let storage = {}
    storage.storageImgArr = _.deepClone(this.selectComponent("#mymulti").data.imgArr)
    storage.storageAreaSize = _.deepClone(this.selectComponent("#mymulti").data.areaSize)
    storage.storageEditAreaSize = _.deepClone(this.selectComponent("#mymulti").data.editAreaSize)
    storage.storageTemplateSrc = _.deepClone(this.selectComponent("#mymulti").data.TemplateSrc)
    storage.id = this.storageEditData[this.preDirection][this.preTemplateTypeIndex].templates[this.preTemplateIndex].id
    if (_.isNotEmpty(storage.storageImgArr) && _.isNotEmpty(storage.storageAreaSize) && _.isNotEmpty(storage.storageEditAreaSize)) {
      this.storageEditData[this.data.direction][this.data.templateTypeIndex].templates[this.data.templateIndex].storage = storage
    }
    let templateArr = _.without(_.pluck(_.flatten(_.pluck(this.storageEditData[this.data.direction], 'templates')), 'storage'), undefined)
    console.log(templateArr)
    let paramData = []
    let that = this
    _.each(templateArr, function(value, index, list) {
      let params = {}
      params.id=value.id
      let pointData=value.storageImgArr
      params.points=that.selectComponent("#mymulti").getImgPoint(pointData,value.storageAreaSize.scale)
      paramData.push(params)
    })
    console.log(paramData)
  }
})
