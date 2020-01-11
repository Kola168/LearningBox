// pages/package_subject/stage_report/index/index.js
var app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
import computedTime from '../../components/choose-time-range/computedTime'
import graphql from '../../../../network/graphql/subject'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0,
    showSubjectForm: false, //是否显示学科选择表单
    showTimeForm: false, //是否显示时间表单
    showSubjectSheet: false, //选择学科sheet
    isFullScreen: false,
    startDate: '', //开始时间
    endDate: '', //结束时间
    subjectData: null, //学科信息
    timeRange: {
      dayRange: [7, 30]
    },
    isReporterEmpty: false,
    reporterList: [], //报告列表
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    let navBarHeight = app.navBarInfo.topBarHeight
    var { startDate, endDate } = computedTime.getCurrentDayToDayFn(7)
    this.setData({
      navBarHeight,
      isFullScreen: app.isFullScreen,
      startDate: computedTime.replaceDate(startDate),
      endDate: computedTime.replaceDate(endDate)
    })
    this.getSubject()
  },

  /**
   * 获取学科信息
   */
  getSubject: co.wrap(function * (){
    try {
      var resp = yield graphql.getSubject()
      if (resp.xuekewang && resp.xuekewang.subjects) {
        this.setData({
          subjects: resp.xuekewang.subjects,
          subjectData: resp.xuekewang.subjects[0]
        })
      }
     
    } catch(err) {
      util.showError(err)
    }
  }),

  /**
   * 生成报告学科选择
   */
  chooseReportForm: function() {
    this.setData({
      showSubjectForm: true
    })
  },

  /**
   * 生成报告
   */
  createReporter: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      console.log(this.data.subjectData, '==学科==', this.data.startDate, '==startDate==')
      console.log('==createReporter==')
      // yield this.getReporter()
    } catch(err) {
      util.showError(err)
    } finally {
      this.longToast.hide()
    }
  }),

  /**
   * 生成报告
   * @param {*} param0 
   */
  getReporter: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getReporter()
      this.setData({
        reporterList: resp.reporter
      })
    } catch(err){
      util.showError(err)
    } finally {
      this.longToast.hide()
    }
  }),

  /**
   * 打开form选择器
   */
  openForm: function({currentTarget: {dataset: {key}}}){
    this.setData({
      [key]: true
    })
  }, 

  /**
   * form选择学科
   */
  chooseSubject: function({detail}) {
    this.setData({
      subjectData: detail,
      showTimeForm: true,
      showSubjectForm: false
    })
  },
  
  /**
   * 选择日期
   * @param {*} e 
   */
  chooseDate: function({detail}) {
    this.setData({
      ...detail,
      showTimeForm: false
    })
    this.createReporter() //生成报告
  },

  /**
   * 通过sheet选择学科
   */
  useSheetCheckedSubject: function({currentTarget: {dataset: {index}}}){
    // console.log(this.data.subjects[index],'===xxxxx====')
    this.setData({
      subjectData: this.data.subjects[index]
    })
    this.cancelSubjectForm()
  },

  /**
   * 关闭学科sheet
   */
  cancelSubjectForm: function() {
    this.setData({
      showSubjectSheet: false
    })
  },

  onUnload: function(){
    storage.remove("subjectsData")
  },

  onHide: function(){
    storage.remove("subjectsData")
  },
})