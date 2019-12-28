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
import commonRequest from '../../../utils/common_request'
import getLoopsEvent from '../../../utils/worker'

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
    this.longToast = new app.weToast()
    this.getTemplateList()
  },

  getTemplateList: co.wrap(function*() {
    let resp = yield graphql.searchCalendarTemplate(this.data.type)
    Loger(resp.feature.categories)
    this.data.mainTemplateList.vertical = _.where(resp.feature.categories, { isHorizontal: "false" })
    this.data.mainTemplateList.horizontal = _.where(resp.feature.categories, { isHorizontal: "true" })
    this.setData({
      templateList: this.data.mainTemplateList
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

    let checkedTemplate = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex].calendarInfos
    Loger(checkedTemplate)
    let modeSize = []
    _.each(checkedTemplate, function(value, index, list) {
      modeSize.push({
        x: value.areaX,
        y: value.areaY,
        areaWidth: value.areaWidth,
        areaHeight: value.areaHeight,
      })
    })
    this.setData({
      paperSize: {
        width: Number(checkedTemplate[0].width),
        height: Number(checkedTemplate[0].height),
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
    try {
      Loger(this.storageEditData, this.preDirection, this.preTemplateTypeIndex,this.preTemplateIndex)
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
      Loger(this.storageEditData)
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
    } catch (e) {
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
    try{


      let storage = {}
      storage.storageImgArr = _.deepClone(this.selectComponent("#mymulti").data.imgArr)
      storage.storageAreaSize = _.deepClone(this.selectComponent("#mymulti").data.areaSize)
      storage.storageEditAreaSize = _.deepClone(this.selectComponent("#mymulti").data.editAreaSize)
      storage.storageTemplateSrc = _.deepClone(this.selectComponent("#mymulti").data.TemplateSrc)
      storage.id = this.storageEditData[this.data.direction][this.data.templateTypeIndex].templates[this.data.templateIndex].sn
      if (_.isNotEmpty(storage.storageImgArr) && _.isNotEmpty(storage.storageAreaSize) && _.isNotEmpty(storage.storageEditAreaSize)) {
        this.storageEditData[this.data.direction][this.data.templateTypeIndex].templates[this.data.templateIndex].storage = storage
      }
      let templateArr = _.without(_.pluck(_.flatten(_.pluck(this.storageEditData[this.data.direction], 'templates')), 'storage'), undefined)
      if(templateArr.length==0){
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
          title: '请参照下图正确放置拇指相册打印纸打印纸',
          image: 'https://cdn-h.gongfudou.com/LearningBox/feature/wood/calendar_confirm_print.png'
        },
      })
    }catch(e){
      Loger(e)
      util.showError(e)
    }
  }),
  makeOrder:co.wrap(function*(){
    try {
      this.longToast.toast({
        type: "loading",
      })
      let templateArr = _.without(_.pluck(_.flatten(_.pluck(this.storageEditData[this.data.direction], 'templates')), 'storage'), undefined)
      Loger(templateArr)
      let paramData = []
      let that = this
      _.each(templateArr, function(value, index, list) {
        let params = {}
        params.template_sn = value.id
        let pointData = value.storageImgArr
        params.sub_images = that.selectComponent("#mymulti").getImgPoint(pointData, value.storageAreaSize.scale)
        paramData.push(params)
      })
      let param = {
        images: paramData
      }
      getLoopsEvent({
        feature_key: this.data.type,
        worker_data: param,
      }, co.wrap(function*(resp){
        Loger(resp)
        if (resp.status == 'finished') {
          that.longToast.toast()
          let imgs=[]
          console.log(resp.data.urls)
          _.each(resp.data.urls,function(value,index,list){
            imgs.push({
              originalUrl:value,
              printUrl:value
            })
          })
          try{


            let orderSn = yield commonRequest.createOrder(that.data.type, imgs)

            wxNav.navigateTo(`/pages/finish/index`, {
              media_type: that.data.type,
              state:orderSn.createOrder.state
            })
            that.longToast.toast()
          }catch(e){
            that.longToast.toast()
            Loger(e)
            util.showError(e)
          }
        }
      }), ()=>{
        that.longToast.toast()
      })
      // Loger(orderSn)
    } catch (e) {
      that.longToast.toast()
      Loger(e)
      util.showError(e)
    }
  })
})
