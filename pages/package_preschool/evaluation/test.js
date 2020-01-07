// pages/package_preschool/evaluation/test.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const event = require('../../../lib/event/event')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import gql from '../../../network/graphql/preschool'
import commonRequest from '../../../utils/common_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    subjectList: [], //问题总列表
    nowIndex: 0, //当前测试index
    remainingTime: 90, //剩余时间
    selectIndex: null,
  },
  originalRemainingTime: 90,
  answerList: [], //回答的问题列表
  is_right:false, //选择的题目的正确与否
  onLoad: function(options) {
    this.sn = options.sn
    this.getTestList()
  },

  getTestList: co.wrap(function*() {
    try {
      let resp = yield gql.getTestList(this.sn)
        this.setData({
          subjectList: resp.examination.questions
        })
        this.startAnswer()
    } catch (e) {
      Loger(e)
    }
  }),


  //问题回答倒计时
  startAnswer: function() {
    let that = this
    this.interval = setInterval(function() {
      that.data.remainingTime--
      if (that.data.remainingTime < 0) {
        that.initQuestion()
        that.data.remainingTime = that.originalRemainingTime
      }
      that.setData({
        remainingTime: that.data.remainingTime,
        nowIndex: that.data.nowIndex,
      })
    }, 1000)
  },

  initQuestion: function() {

    let param = this.data.subjectList[_.clone(this.data.nowIndex)]
    this.answerList.push({
      sn: param.categorySn,
      category_name: param.categoryName,
      is_right: _.clone(this.is_right)
    })
    this.data.nowIndex += 1
    this.is_right=false
    if (this.data.nowIndex > (this.data.subjectList.length - 1)) {
      return this.toSummary()
    }
    this.setData({
      selectIndex:null
    })
  },

  selectAnswer: function(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      selectIndex:index
    })
    this.data.remainingTime=this.data.remainingTime<=3?this.data.remainingTime:3
    this.is_right=this.data.subjectList[this.data.nowIndex].answers[index].isRight
  },

  toSummary: function() {
    clearInterval(this.interval)
    wxNav.redirectTo('/pages/package_preschool/evaluation/testfinish', {
      snlist: encodeURIComponent(JSON.stringify(this.answerList)),
      sn:this.sn
    })
  }
})
