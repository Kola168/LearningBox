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
    direction: 'vertical', //模板方向
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
    this.checkdirection(this.data.direction)
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

    let checkedTemplate = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].positionInfo
    console.log(checkedTemplate)
    let modeSize = []
    if (checkedTemplate.length>0) {
      _.each(checkedTemplate, function(value, index, list) {
        modeSize.push({
          x: value.areaX,
          y: value.areaY,
          areaWidth: value.areaWidth,
          areaHeight: value.areaHeight,
        })
      })
    } else {
      modeSize.push({
        x: checkedTemplate.areaX,
        y: checkedTemplate.areaY,
        areaWidth: checkedTemplate.areaWidth,
        areaHeight: checkedTemplate.areaHeight,
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
        modeSrc: this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].imageUrl,
        modeSize: modeSize
      }
    })
    this.selectComponent("#mymulti").setData({
      imgArr: []
    })
  },

  checkModeStorage: function() {
    try{
      console.log(this.storageEditData,this.preDirection,this.preTemplateTypeIndex)
      let storage = {}
      storage.storageImgArr = _.deepClone(this.selectComponent("#mymulti").data.imgArr)
      storage.storageAreaSize = _.deepClone(this.selectComponent("#mymulti").data.areaSize)
      storage.storageEditAreaSize = _.deepClone(this.selectComponent("#mymulti").data.editAreaSize)
      storage.storageTemplateSrc = _.deepClone(this.selectComponent("#mymulti").data.TemplateSrc)
      storage.id = this.storageEditData[this.preDirection][this.preTemplateTypeIndex].templates[this.preTemplateIndex].sn
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
    }catch(e){
      Loger(e)
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

  confBut: co.wrap(function*() {
    let storage = {}
    storage.storageImgArr = _.deepClone(this.selectComponent("#mymulti").data.imgArr)
    storage.storageAreaSize = _.deepClone(this.selectComponent("#mymulti").data.areaSize)
    storage.storageEditAreaSize = _.deepClone(this.selectComponent("#mymulti").data.editAreaSize)
    storage.storageTemplateSrc = _.deepClone(this.selectComponent("#mymulti").data.TemplateSrc)
    storage.id = this.storageEditData[this.preDirection][this.preTemplateTypeIndex].templates[this.preTemplateIndex].sn
    if (_.isNotEmpty(storage.storageImgArr) && _.isNotEmpty(storage.storageAreaSize) && _.isNotEmpty(storage.storageEditAreaSize)) {
      this.storageEditData[this.data.direction][this.data.templateTypeIndex].templates[this.data.templateIndex].storage = storage
    }
    let templateArr = _.without(_.pluck(_.flatten(_.pluck(this.storageEditData[this.data.direction], 'templates')), 'storage'), undefined)
    console.log(templateArr)
    let paramData = []
    let that = this
    _.each(templateArr, function(value, index, list) {
      let params = {}
      params.template_sn=value.id
      let pointData=value.storageImgArr
      params.sub_images=that.selectComponent("#mymulti").getImgPoint(pointData,value.storageAreaSize.scale)
      paramData.push(params)
    })
    console.log(paramData)
    let param={
      is_async:false,
      feature_key:this.data.type,
      images:paramData
    }
    const resp = yield api.processes(param)
    if(resp.code==0){
      this.setData({
        confirmModal: {
          isShow: true,
          title: '请参照下图正确放置照片纸',
          image: 'https://cdn-h.gongfudou.com/LearningBox/main/confirm_print.png'
        },
      })
    }
  })
})
