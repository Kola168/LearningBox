// pages/package_feature/kousuan/learningplan.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'

Page({

  data: {
    planTypeCheck:'executing',
    unSetList:[],
    executingList:[{
      name:'七天专项练习1',
      calculateType:'纯口算',
      typeName:'十以内加减法',
      startTime:'2019-09-09 20:00',
      finishTime:'2019-09-19 20:00',
      time:'08:00',
    }],
    finishedList:[{
      name:'七天专项练习1',
      calculateType:'纯口算',
      typeName:'十以内加减法',
      startTime:'2019-09-09 20:00',
      finishTime:'2019-09-19 20:00',
      time:'08:00',
      state:'已停止',
    }]
  },

  onLoad: function (options) {

  },

  checkPlanType:function(e){
    let type=e.currentTarget.dataset.type
    this.setData({
      planTypeCheck:type
    })
  },

  createPlan:function(){
    wxNav.navigateTo('/pages/package_feature/kousuan/createplan')
  },

})
