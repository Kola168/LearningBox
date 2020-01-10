// pages/package_subject/weakness_exercise/index/index.js
var app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
import api from '../../../../network/restful_request'
import graphql from '../../../../network/graphql/subject'
import getLoopsEvent from '../../../../utils/worker'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modal: {
      isShow: true,
      title: '开通学科会员，专项同步练习',
      slotContent: false,
      content: '专享错题薄弱同类练习题推送',
      image: 'https://cdn-h.gongfudou.com/LearningBox/subject/weakness_member_banner.png',
      slotBottom: true
    },
    showSubjectForm: false, //是否显示科目状态表单
    showPrintForm: false, //是否显示打印状态表单
    showSubjectCheckbox: false, //是否选择科目
    showTimeCheckbox: false,
    showKnowledgeCheckbox: false, //是否显示选择知识点
    navBarHeight: 0,
    timeRange: {
      appoint: ['today', 'yesterday'],
      dayRange: [7]
    },
    knowledgeList: [],
    subjects: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.longToast = new app.weToast()
    let navBarHeight = app.navBarInfo.topBarHeight
    this.setData({
      navBarHeight,
      isFullScreen: app.isFullScreen
    })
    this.getSubject()
    this.getExerciseList()
  },

   /**
   * 获取学科信息
   */
  getSubject: co.wrap(function*(){
    try {
      var resp = yield graphql.getSubject()
      this.setData({
        subjects: resp.xuekewang.subjects,
        currentSubject: resp.xuekewang.subjects[0],
      })
    } catch(err) {
      console.log(err)
    }
  }),

  /**
   * 获取知识点
   */
  getKnowledges: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })

    try {
      var resp = yield graphql.getKnowledges({
        sn: this.data.checkedSubject.sn,
        startTime: this.data.checkedDate.startDate,
        endTime: this.data.checkedDate.endDate
      })

      this.setData({
        knowledgeList: resp.xuekewangSubject.knowledges
      })
      this.longToast.hide()
    } catch(err) {
      this.longToast.hide()
      util.showError(err)
    }
  }),

  /**
   * 选择知识点 
   * @param {*} param0 
   */
  switchKnowledge: function({currentTarget: {dataset: {index}}}) {
    this.setData({
      [`knowledgeList[${index}].checked`]: !this.data.knowledgeList[index].checked
    })
  },

  /**
   * 选择学科
   * @param {*} e 
   */
  chooseSubject: function({detail}) {
    this.setData({
      showSubjectCheckbox: false,
      showTimeCheckbox: true,
      checkedSubject: detail
    })
  },

  /**
   * 选择日期
   * @param {*} e 
   */
  chooseDate: function({detail}) {
    this.setData({
      showTimeCheckbox: false,
      showKnowledgeCheckbox: true,
      checkedDate: detail
    })
    this.getKnowledges()
  },

  /**
   * 获取练习列表
   */
  getExerciseList: co.wrap(function*(){
    try {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })
      // 2091261782649911
      var resp = yield graphql.getKnowledgeExercises(this.data.checkedSubject.sn)
      this.setData({
        exerciseList: resp.xuekewang.exercises
      })
      this.longToast.hide()
    } catch(err) {
      this.long.hide()
    }
  }),

  /**
   * 确认练习
   */
  confirmExercise: function(){
    // var member = this.selectComponent('#memberToast')
    // member.showToast()
    this.setData({
      showSubjectCheckbox: true
    })
  },

  /**
   * 生成练习
   */
  createExercise: function(){
    //var ids = this.knowedgeIds()
    this.longToast.toast({
      type: 'loading',
      title: '正在出题...'
    })

    getLoopsEvent({
      feature_key: 'xuekewang_exercise',
      worker_data: {
        exercise_type: 'kpoint',
        // subject_sn: this.data.checkedSubject.sn,
        // end_time: this.data.checkedDate.endDate,
        // start_time: this.data.checkedDate.startDate,
        // ids: ids
        subject_sn: 2091261782649911,
        end_time: '2020-01-23',
        start_time: '2019-06-17',
        ids: '10418'
      }
    }, (resp) => {
      if (resp.status == 'finished') {
        this.longToast.hide()
        this.setData({
          showKnowledgeCheckbox: false
        })
        this.getExerciseList()
      }
    }, () => {
      this.longToast.hide()
    })
  },

  /**
   * 匹配知识点ids
   */
  knowedgeIds: function() {
    var knowedges = this.data.knowledgeList.filter(item=>item.checked)
    var ids = knowedges.length && knowedges.reduce((pre,cur)=>[''+ pre.id].concat('' + cur.id) || [])
    return ids.join(',')
  },

  /**
   * 搜索分类
   */
  searchCategory: co.wrap(function *({currentTarget: {dataset: {key}}}) {

    if (key == 'subject') {
      this.setData({
        showSubjectForm: true
      }) 
    }
  }),

  toPrint: function(){
    console.log('==去打印==')
    // wxNav.navigateTo()
  },

  onUnload: function(){
    storage.remove("subjectsData")
  },

  onHide: function(){
    storage.remove("subjectsData")
  },
})