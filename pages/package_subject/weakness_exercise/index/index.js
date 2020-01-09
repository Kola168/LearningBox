// pages/package_subject/weakness_exercise/index/index.js
var app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
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
    knowledgeList: []
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
  },

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
    console.log(detail,'====xxx')
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
    console.log(detail,'====xxx')
    this.setData({
      showTimeCheckbox: false,
      showKnowledgeCheckbox: true,
      checkedDate: detail
    })
    this.getKnowledgeList()
  },

  

  /**
   * 获取知识点列表
   */
  getKnowledgeList: co.wrap(function*(){
    try {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })
      setTimeout(()=>{
        this.setData({
          knowledgeList: [{
              checked: false,
              name: '函数的概念及基本初等函数函数'
          },
          {
            checked: true,
            name: '立体几何初步'
          }]
        })
        this.longToast.hide()
      }, 2000)
    } catch(err) {
      this.longToast.hide()
    }
  }),

  /**
   * 获取练习列表
   */
  getExerciseList: co.wrap(function*(){
    console.log('getExerciseList')
    try {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })
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
    this.getExerciseList()
  },

  /**
   * 搜索分类
   */
  searchCategory: co.wrap(function *({currentTarget: {dataset: {key}}}) {
    if (key == 'subject') {

    }
  }),

  onUnload: function(){
    storage.remove("subjectsData")
  },

  onHide: function(){
    storage.remove("subjectsData")
  },
})