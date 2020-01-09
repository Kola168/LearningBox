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
    navBarHeight: 0,
    timeRange: {
      appoint: ['today', 'yesterday'],
      dayRange: [7]
    },
    knowledgeList: [
      {
        checked: false,
        name: '函数的概念及基本初等函数函数'
      },
      {
        checked: true,
        name: '立体几何初步'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
  },
  /**
   * 选择日期
   * @param {*} e 
   */
  chooseDate: function({detail}) {
    console.log(detail,'====xxx')
  },

  /**
   * 生成练习
   */
  createExercise: function(){
    console.log('创建createExercise')
  },

  onPullDownRefresh: function () {

  },

  onShareAppMessage: function () {

  }
})