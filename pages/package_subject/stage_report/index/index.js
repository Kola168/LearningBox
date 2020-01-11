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
    isFullScreen: false,
    startDate: '', //开始时间
    endDate: '', //结束时间
    subjectData: null, //学科信息
    timeRange: {
      dayRange: [7, 30]
    },
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
  getSubject: co.wrap(function*(){
    try {
      var resp = yield graphql.getSubject()
      if (resp.xuekewang && resp.xuekewang.subjects) {
        this.setData({
          subjects: resp.xuekewang.subjects,
          subjectData: resp.xuekewang.subjects[0]
        })
      }
     
    } catch(err) {
      console.log(err)
    }
  }),

  /**
   * 生成报告
   */
  createExercise: co.wrap(function*(){
    try {
      console.log('==createExercise==')
    } catch(err) {

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
   * 选择学科
   */
  chooseSubject: function({detail}) {
    console.log(detail,'====xxx')
    this.setData({
      subjectData: detail,
      showSubjectForm: false
    })
  },
  
  /**
   * 选择日期
   * @param {*} e 
   */
  chooseDate: function({detail}) {
    console.log(detail,'====xxx')
    this.setData({
      ...detail,
      showTimeForm: false
    })
  },

  onUnload: function(){
    storage.remove("subjectsData")
  },

  onHide: function(){
    storage.remove("subjectsData")
  },
})