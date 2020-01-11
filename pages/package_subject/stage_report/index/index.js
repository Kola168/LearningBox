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

  onLoad: co.wrap(function * (options) {
    this.longToast = new app.weToast()
    this.page = 1
    let navBarHeight = app.navBarInfo.topBarHeight
    var { startDate, endDate } = computedTime.getCurrentDayToDayFn(7)
    this.setData({
      navBarHeight,
      isFullScreen: app.isFullScreen,
      startDate: computedTime.replaceDate(startDate),
      endDate: computedTime.replaceDate(endDate)
    })
    yield this.getSubject()
    yield this.getReporter()
  }),

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
      var resp = yield graphql.createStageeport({
        sn: this.data.subjectData.sn,
        startAt: this.data.startDate,
        endAt: this.data.endDate,
      })
      if (resp.createXuekewangReport.state) {
        yield this.getReporter()
      } else {
        wx.showModal({
          title: '提示',
          content: '生成失败'
        })
      }

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
      var resp = yield graphql.getReporter(this.data.subjectData.sn, this.page,  this.data.startDate, this.data.endDate, 'XuekewangSubjectReport')
      this.setData({
        reporterList: resp.xuekewang.reports,
        isReporterEmpty: resp.xuekewang && resp.xuekewang.reports.length ? false : true
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
      showSubjectForm: false,
      isUserSheetForm: false,
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
    /**
     * 判断是否从筛选框进入 是则直接获取报告
     */
    if (this.data.isUserSheetForm) {
      return this.getReporter()
    }

    this.createReporter() //生成报告
  },

  /**
   * 通过sheet选择学科
   */
  useSheetCheckedSubject: function({currentTarget: {dataset: {index}}}){
    this.setData({
      subjectData: this.data.subjects[index],
      isUserSheetForm: true,
      isReporterEmpty: false,
    })
    this.cancelSubjectForm()
    this.getReporter()
  },

  /**
   * 关闭学科sheet
   */
  cancelSubjectForm: function() {
    this.setData({
      showSubjectSheet: false
    })
  },

   /**
   * 去打印
   */
  toPrint: function({currentTarget: {dataset: {sn}}}){
    wxNav.navigateTo('../../report/index', {
      sn
    })
  },

  onUnload: function(){
    storage.remove("subjectsData")
  },

  onHide: function(){
    storage.remove("subjectsData")
  },
})