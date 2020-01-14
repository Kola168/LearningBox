// pages/package_subject/sync_video/index/index.js
var app = getApp()
const event = require('../../../../lib/event/event')
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
import graphqlAll from '../../../../network/graphql_request'
import graphql from '../../../../network/graphql/subject'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentStageIndex: 0,
    currentSubjectIndex: 0,
    showStageForm: false, //是否显示学科表单
    subjectList: [], //学科列表
    stages: [], // 学段列表
    stage: null, //学段信息
    stageSn: null, //学段sn
    checkedSubject: null, //选中的学科信息
    videoList: [], //视频列表
    currentUser: null, //用户信息
    kidVideoCount: 0, //用户观察次数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function * (options) {
    let navBarHeight = app.navBarInfo.topBarHeight
    this.setData({
      navBarHeight,
      currentStageIndex: options.index ? options.index : 0
    })
    this.longToast = new app.weToast()

    event.on('Authorize', this, ()=>{
      this.initData()
    })

    if (!app.isScope()) {
      return wxNav.navigateTo("/pages/authorize/index")
    }

    
    this.initData()
  }),

  /**
   * 初始化数据
   */
  initData: co.wrap(function * (){
    yield this.getUser()
    yield this.getStages()
    yield this.getvideoSubject()
    yield this.getvideoList()
  }),

  /**
   * 选择学段
   */
  chooseStage: co.wrap(function*({currentTarget: {dataset: {index}}}){
    this.setData({
      currentStageIndex: index,
      videoList: [],
      stage: this.data.stages[index]
    })
    this.closeStageForm()
    yield this.getvideoSubject()
    yield this.getvideoList()
  }),

  toVideo: function({currentTarget: {dataset: {sn}}}) {
    wxNav.navigateTo("../video_list/video_list", {
      sn,
      stageSn: this.data.stage.sn,
      subjectId: this.data.subjectList[this.data.currentSubjectIndex]
    })
  },

  /**
   * 获取用户信息 
   */
  getUser: co.wrap(function * (){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphqlAll.getUser()
      if (resp.currentUser) {
        this.setData({
          currentUser: resp.currentUser,
          stageSn: resp.currentUser.selectedKid.stage.sn
        })
      }
    } catch(err){
      util.showError(err)
    } finally {
      this.longToast.hide()
    }
  }),

  /**
   * 注册学科网
   */
  register: co.wrap(function * (){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      yield graphql.register()
      yield this.getStages()
    } catch(err){
      util.showError(err)
    } finally {
      this.longToast.hide()
    }
  }),

  /**
   * 获取学段列表
   */
  getStages: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getStages(this.data.stageSn)
      var stages = resp.xuekewangVideoSubject.stages

      if (!resp.xuekewang.registered) {
        return this.register()
      }
      var [stage] = stages.filter((item, index)=>{
        if (item.sn == this.data.stageSn) {
          this.data.currentStageIndex = index
          return item
        }
      })
      this.setData({
        stages,
        currentStageIndex: this.data.currentStageIndex,
        stage
      })
    } catch(err){
      util.showError(err)
    } finally {
      this.longToast.hide()
    }
  }),

  /**
   * 获取学科网视频学科列表
   */
  getvideoSubject: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getvideoSubject(this.data.stage.sn)
      if (resp.xuekewangVideoSubject) {
        this.setData({
          kidVideoCount: resp.xuekewangVideoSubject.subjects[this.data.currentSubjectIndex].kidVideoCount,
          subjectList: resp.xuekewangVideoSubject.subjects,
        })
      }
      
    } catch(err){
      util.showError(err)
    } finally {
      this.longToast.hide()
    }
  }),

    /**
   * 获取学科网视频学科列表
   */
  getvideoList: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })

    try {
      var resp = yield graphql.getvideoList(this.data.stage.sn, this.data.subjectList[this.data.currentSubjectIndex].courseId)
      this.setData({
        videoList: resp.xuekewangVideos
      })
    } catch(err){
      util.showError(err)
    } finally {
      this.longToast.hide()
    }
  }),

  /**
   * 选择学段
   */
  chooseSubject: co.wrap(function*({currentTarget: {dataset:{index}}}){
    try {
      this.setData({
        kidVideoCount: this.data.subjectList[index].kidVideoCount,
        currentSubjectIndex: index,
        showStageForm: false,
        videoList: [],
        checkedSubject: this.data.subjectList[index]
      })
      this.getvideoList()
    } catch(err) {
      console.log(err)
    }
  }),

  /**
   * 关闭学科选择器
   */
  closeStageForm: function() {
    this.setData({
      showStageForm: false
    })
  },

  /**
   * 弹出学科选择器
   */
  openStageForm: function() {
    this.setData({
      showStageForm: true
    })
  },

  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})