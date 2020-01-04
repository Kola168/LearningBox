// pages/package_feature/kousuan/pointslist.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const event = require('../../../lib/event/event')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql/feature'
import commonRequest from '../../../utils/common_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    title: '口算',
    pointsList: [],
    addNum: 20, //单次点击增减数量
    totalTapNum: 5, //总点击次数为五次
    nowTap: 0, //当前点击次数
    printAnswer:false, //打印答案
  },

  onLoad: function(options) {
    this.sn = options.sn
    this.setData({
      title: options.title
    })
    this.longToast = new app.weToast()
    this.getKnowledgeList()
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    }
    event.on('webViewData', this, (postData) => {
      this.checkWebViewData(postData)
    })
  },

  onUnload: function() {
    event.remove('webViewData', this)
  },

  getKnowledgeList: co.wrap(function*() {
    try {
      this.longToast.toast({
        type: 'loading'
      })
      let resp = yield graphql.getKnowledgePoints(this.sn)
      this.setData({
        pointsList: resp.category.children
      })
      this.initTapNum()
      this.longToast.toast()
    } catch (e) {
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }
  }),

  //初始化各项点击次数
  initTapNum: function() {
    _.map(this.data.pointsList, function(val) {
      return _.extend(val, { tapNum: 0 })
    })
    this.setData({
      pointsList: this.data.pointsList
    })
  },

  decreaseNum: function(e) {
    let index = e.currentTarget.dataset.index
    if (this.data.pointsList[index].tapNum <= 0 || this.data.nowTap <= 0) {
      return
    }
    this.data.pointsList[index].tapNum--
    this.data.nowTap--
    this.setData({
      [`pointsList[${index}]`]: this.data.pointsList[index],
      nowTap: this.data.nowTap
    })
  },

  increaseNum: function(e) {
    let index = e.currentTarget.dataset.index
    if (this.data.nowTap >= this.data.totalTapNum) {
      return
    }
    this.data.pointsList[index].tapNum++
    this.data.nowTap++
    this.setData({
      [`pointsList[${index}]`]: this.data.pointsList[index],
      nowTap: this.data.nowTap
    })
  },

  confBut: co.wrap(function*() {
    try {
      if(this.data.nowTap==0){
        return wx.showModal({
          title:'提示',
          content:'请至少选择一题',
          showCancel: false,
          confirmColor: '#FFE27A'
        })
      }
      this.longToast.toast({
        type: "loading",
      })
      let checkedArr=[]
      _.each(this.data.pointsList,function(value,index,list){
        if(value.tapNum>0){
          checkedArr.push({
            category_sn:value.sn,
            count:value.tapNum
          })
        }
      })
      let param = {
        is_async: false,
        feature_key: "kousuan",
        answer:this.data.printAnswer,
        data: checkedArr
      }
      const resp = yield api.processes(param)
      this.orderSn=resp.res.sn
      wxNav.navigateTo('/pages/package_feature/kousuan/previewWebview',{
        url:encodeURIComponent(JSON.stringify(resp.res.url))
      })
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
      Loger(e)
    }

  }),

  selectAnswer:function(){
    this.setData({
      printAnswer:!this.data.printAnswer
    })
  },

  checkWebViewData: co.wrap(function*(val) {
    Loger(val)
    if(val===true){
      try {
        this.longToast.toast({
          type: 'loading'
        })
        let resp = yield graphql.createKousunOrder({
          featureKey:'kousuan',
          resourceOrderType:'Kousuan',
          resourceAttribute:{
            sn:this.orderSn,
            answer:this.data.printAnswer
          }
        })
        Loger(resp)
        wxNav.navigateTo(`/pages/finish/index`, {
          media_type: 'kousuan',
          state:resp.createResourceOrder.state
        })
        this.longToast.toast()
      } catch (e) {
        Loger(e)
        this.longToast.toast()
        util.showError(e)
      }
    }
  }),
})
