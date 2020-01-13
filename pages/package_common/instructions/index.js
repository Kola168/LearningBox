// pages/package_common/instructions/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql/common'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    equipmentBrand: [],
    equipmentIndex: 0,
    brandIndex: 0,
    questionList: [], //问题列表
    pickList: null,
    pickType: null
  },

  onLoad: co.wrap(function*(options) {
    this.longToast = new app.weToast()
    this.printerModels()
    let equipmentIndex = 0
    let brandIndex = 0
    _.each(this.data.equipmentBrand, function(value, index, list) {
      let searchIndex = _.findIndex(value.printerModels, {
        isSelected: true
      })
      if (searchIndex >= 0) {
        equipmentIndex = index
        brandIndex = searchIndex
      }
    })
    this.setData({
      equipmentIndex: equipmentIndex,
      brandIndex: brandIndex
    })
  }),

  checkType: function(e) {
    let type = e.currentTarget.dataset.type
    if (type == this.data.pickType) {
      this.hidePicker()
    }
    this.setData({
      pickType: type
    })
  },

  hidePicker: function() {
    this.setData({
      pickType: null,
      pickList: null
    })
    this.printerModels()
  },

  changePick: function(e) {
    let index = e.currentTarget.dataset.index
    let checkedIndex = this.data.pickType == 'maker' ? 'equipmentIndex' : 'brandIndex'
    if(this.data[checkedIndex]==index){
      this.hidePicker()
    }else{
      this.setData({
        [checkedIndex]:index
      })
      if(checkedIndex=='equipmentIndex'){
        this.setData({
          brandIndex:0
        })
      }
    }
  },

  printerModels: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield graphql.printerModels()
      this.setData({
        equipmentBrand: resp.printerModels
      })

      this.longToast.toast()
      this.instructions()
    } catch (e) {
      this.longToast.toast()
      Loger(e)
      util.showError(e)
    }
  }),

  instructions: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield graphql.instructions({
        printerModelSn: this.data.equipmentBrand[this.data.equipmentIndex].printerModels[this.data.brandIndex].sn,
        keyword: '',
        isGuesses: false
      })
      this.setData({
        questionList: resp.instructions
      })
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      Loger(e)
      util.showError(e)
    }
  }),

  toSearch: function() {
    wxNav.navigateTo('/pages/package_common/instructions/search')
  },

  toPreview:function(e){
    let index=e.currentTarget.dataset.index
      wxNav.navigateTo('/pages/webview/index',{
        url:`${app.apiServer}/mini_web/instructions/${this.data.questionList[index].sn}`
      })
  }
})
