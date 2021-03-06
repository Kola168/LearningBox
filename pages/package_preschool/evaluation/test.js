// pages/package_preschool/evaluation/test.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import gql from '../../../network/graphql/preschool'
const downloadFile=util.promisify(wx.downloadFile)

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
  is_right: false, //选择的题目的正确与否
  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.sn = options.sn
    this.audioCtx = wx.createInnerAudioContext()
    this.audioCtx.obeyMuteSwitch = false
    wx.setInnerAudioOption({
      obeyMuteSwitch: false
    })
    this.getTestList()
  },

  onUnload:function(){
    clearInterval(this.interval)
  },

  getTestList: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield gql.getTestList(this.sn)
      this.setData({
        subjectList: resp.examination.questions
      })
      if(this.data.subjectList[this.data.nowIndex].audioUrl){
        this.initAudio()
      }
      this.longToast.toast()
      this.startAnswer()
    } catch (e) {
      this.longToast.toast()
      Loger(e)
      util.showError(e)
    }
  }),

  onHide:function(){
    this.stopVideo()
  },

  audioPlaying:false,

  initAudio:function(){
    let that = this
    this.longToast.toast({
      type: 'loading'
    })

    this.audioCtx.src = this.data.subjectList[this.data.nowIndex].audioUrl
    this.audioCtx.autoplay=true
    that.audioCtx.onCanplay(function(){
      that.longToast.toast()
      that.audioCtx.offCanplay()
    })

    this.audioCtx.onEnded(function(){
      console.log(111111)
      that.audioPlaying=false
    })
    this.audioCtx.onError(function(res){
      console.log(res)
      that.audioCtx.stop()
    })
    this.audioCtx.onTimeUpdate(function(){
      console.log(that.audioCtx.duration,that.audioCtx.currentTime)
    })
    this.audioCtx.onStop(function(){
      console.log(2222222)
      that.audioPlaying=false
    })
  },
  playVideo: function(e) {
    try{
      if(this.audioPlaying){
        this.stopVideo()
        return
      }
      console.log(this.audioCtx.src)
      this.audioPlaying=true
      this.audioCtx.play()
    }catch(e){
      console.log(e)
    }
  },

  stopVideo: function() {
    this.audioCtx.stop()
  },

  //问题回答倒计时
  startAnswer: function() {
    let that = this
    this.interval = setInterval(function() {
      that.data.remainingTime--
      console.log(that.data.remainingTime)
      console.log(that.interval)
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

  initQuestion: co.wrap(function*() {

    let param = this.data.subjectList[_.clone(this.data.nowIndex)]
    this.answerList.push({
      sn: param.categorySn,
      category_name: param.categoryName,
      is_right: _.clone(this.is_right)
    })
    this.data.nowIndex += 1
    this.is_right = false
    this.stopVideo()

    if (this.data.nowIndex > (this.data.subjectList.length - 1)) {
      return this.toSummary()
    }
    if(this.data.subjectList[this.data.nowIndex].audioUrl){
      this.initAudio()
    }
    this.setData({
      selectIndex: null
    })
  }),

  selectAnswer: function(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      selectIndex: index
    })
    this.data.remainingTime = this.data.remainingTime <= 2 ? this.data.remainingTime : 2
    this.is_right = this.data.subjectList[this.data.nowIndex].answers[index].isRight
  },

  toSummary: function() {
    clearInterval(this.interval)
    wxNav.redirectTo('/pages/package_preschool/evaluation/testfinish', {
      snlist: encodeURIComponent(JSON.stringify(this.answerList)),
      sn: this.sn
    })
  }
})
