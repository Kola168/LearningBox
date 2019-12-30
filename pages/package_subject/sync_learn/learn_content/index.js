// pages/package_subject/sync_learn/learn_content/index.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
const request = util.promisify(wx.request)
import graphql from '../../../../network/graphql_request'
import storage from '../../../../utils/storage'
import router from '../../../../utils/nav'
import Logger from '../../../../utils/logger.js'
import busFactory from '../busFactory'
console.log(busFactory,'==busFactory==')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showSelectedText: false, //是否显示教材
    selectedBookVersionIndex: -1, //教材版本选中下标
    selectedTeachIndex: -1, //教材选中下标
    gradeList: [], //年级列表
    currentTabIndex: 0, //当前选中的学科index
    subjectIndex: 0,
    subjectList: [], //学科列表
    textbookVersion: [], //学科版本
    teachBook: [], //教材
    subjectId: null, //学科id
    selectedTextbookVersion: false, //当前学科是否包含选中的教材版本
    selectedTextbook: false, //当前学科是否包含选中的教材
    loadSuccess: false, //是否将数据请求完成
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function *(options) {
    this.longToast = new app.weToast()
    this.setData({
      subjectIndex: options.index !=null ? options.index : 0
    })
    yield this.getSubjectList()

    if (this.data.subjectList.length) {
      var subjectIndex = this.data.subjectIndex
      busFactory.sendRequestIds('subjectId', this.data.subjectList[subjectIndex].subjectId)
      this.subjectId = busFactory.getIds('subjectId')
      this.updateConditionData()
    }
  }),


  touchText: function() {
    this.setData({
      showSelectedText: !this.data.showSelectedText
    })
  },

  /**
   * 选择教材版本
   */
  chooseTextbooVersion: co.wrap(function *(e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      selectedBookVersionIndex: index,
      selectedTextbookVersion: this.data.textbookVersion[index],
      selectedTeachIndex: -1,
    })
    this.versionId = this.data.textbookVersion[index].versionId
    busFactory.sendRequestIds('versionId', this.versionId)
    busFactory.removeTextbookData()
    yield this.getTeachBook()
  }),

  /**
   * 选择教材
   * @param {} param0 
   */
  chooseTextbook: co.wrap(function *(e) {
    this.longToast.toast({
      title: '请稍后...',
      type: 'loading'
    })
    try {
      var index = e.currentTarget.dataset.index
      this.setData({
        selectedTeachIndex: index,
        selectedTextbook: this.data.teachBook[index],
        showSelectedText: false,
      })
      this.textbookId = this.data.teachBook[index].textbookId
      busFactory.sendRequestIds('textbookId', this.textbookId) //设置教材id缓存
      busFactory.removeCurrentChapterList(this.subjectId) //更新了教材 移除默认缓存章节数据
      yield busFactory.sendGetChapter(this.subjectId, this.versionId, this.textbookId) // 发送章节数据请求
      this.longToast.hide()
    } catch(err) {
      this.longToast.hide()
    }
  }),

  /**
   * 选择学科
   * @param {*} param
   */
  chooseSubject: function({currentTarget: {dataset: {index}}}) {
    var subjectId =  this.data.subjectList[index].subjectId
    this.setData({
      currentTabIndex: index
    })
    this.subjectId = subjectId
    busFactory.sendRequestIds('subjectId', subjectId) //同步学科id 缓存
    this.updateConditionData() //学科下所有数据节点更新
  },

  /**
   * 选择教材组件内传入
   */
  chooseComponentTextbook: co.wrap(function*(){
    try {
      this.versionId = busFactory.getIds('versionId')
      this.textbookId =  busFactory.getIds('textbookId')
      this.longToast.toast({
        title: '请稍后...',
        type: 'loading'
      })
      busFactory.removeSelectedCurrentData(this.subjectId) //移除上一次选择的值
      yield this.getSelectedTextbookVersion() //获取更新后的教材版本
      yield this.getSelectedTextbook() //获取更新后的教材
    } catch(err) {
      this.longToast.hide()
    } finally {
      this.longToast.hide()
    }


  }),
  /**
   * 获取所有条件筛选数据
   */
  updateConditionData: co.wrap(function*(){
    try {
      this.setData({
        subjectId: this.subjectId,
        loadSuccess: false, //重置组件显示状态
        selectedTextbookVersion: false, //当前学科是否包含选中的教材版本
        selectedTextbook: false, //当前学科是否包含选中的教材
      })
      this.longToast.toast({
        title: '请稍后...',
        type: 'loading'
      })
      busFactory.getComponentsChapterDataFn([]) //清空章节列表
      yield this.getSelectedTextbookVersion() //获取当前科目下选中教材版本
      yield this.getTextbookVersion() //获取当前学科所有教材版本
      yield this.getTeachBook() //获取学科下所有教材
      yield this.getSelectedTextbook() //获取当前科目下选中教材
      yield this.mappingConditions() //同步匹配默认筛选项
      yield busFactory.sendGetChapter(this.subjectId, this.versionId, this.textbookId) //初始化章节列表组件数据
      this.longToast.hide()
    } catch(err) {
      this.longToast.hide()
    }
  }),

  /**
   * 获取学科
   */
  getSubjectList: co.wrap(function*(){
    try {
      var resp = yield graphql.getSubject()
      if (!resp.xuekewang.registered) {
        return 
      }

      this.setData({
        subjectList: resp.xuekewang.subjects,
      })
    } catch(err) {
      util.showError(err)
    }
  }),

  /**
   * 获取教材版本
   */
  getTextbookVersion: co.wrap(function*(){
    try {
      var resp = yield busFactory.getTextbookVersionData(this.subjectId)
      this.setData({
        textbookVersion: resp.xuekewang.textbookVersions
      })
      if (!this.versionId) {
        busFactory.sendRequestIds('versionId', resp.xuekewang.textbookVersions[0].versionId)
        this.versionId = resp.xuekewang.textbookVersions[0].versionId
      }
    } catch(err) {
      util.showError(err)
    }
  }),

  /**
   * 获取教材信息
   */
  getTeachBook: co.wrap(function*(){
    try {
      var resp = yield busFactory.getTextbookData(this.subjectId, this.versionId)
      this.setData({
        teachBook: resp.xuekewang.textbooks
      })
    }catch(err) {
      util.showError(err)
    }
  }),

  /**
   * 获取选中教材
   */
  getSelectedTextbook: co.wrap(function*(){
    try {
      var resp = yield busFactory.getSelectedTextbookData(this.subjectId)
      this.setData({
        selectedTextbook: resp.xuekewang && resp.xuekewang.selectedTextbook
      })
      if (resp.xuekewang) {
        this.textbookId = resp.xuekewang.selectedTextbook && resp.xuekewang.selectedTextbook.textbookId
        busFactory.sendRequestIds('textbookId', this.textbookId)
      }
    }catch(err) {
      this.setData({
        selectedTextbook: false
      })
      util.showError(err)
    }
  }),

    /**
   * 获取选中教材版本
   */
  getSelectedTextbookVersion: co.wrap(function*(){
    try {
      var resp = yield busFactory.getSelectedTextbookVersionData(this.subjectId)
      this.setData({
        selectedTextbookVersion: resp.xuekewang && resp.xuekewang.selectedTextbookVersion,
      })
      if (resp.xuekewang) {
        this.versionId = resp.xuekewang.selectedTextbookVersion && resp.xuekewang.selectedTextbookVersion.versionId
        busFactory.sendRequestIds('versionId', this.versionId)
      }
    }catch(err) {
      this.setData({
        selectedTextbookVersion: false
      })
      util.showError(err)
    }
  }),

  /**
   * 获取到章节列表 
   */
  getChapterList: co.wrap(function*(){
    try{
      var resp = yield graphql.getChapter({
        subjectId: this.subjectId,
        versionId: this.versionId,
        textbookId: this.textbookId
      })
      this.setData({

      })
    } catch(err) {
      util.showError(err)
    }
  }),

  /**
   * 匹配当前学科下默认选中索引集合 教材版本 & 教材 两个数据的index
   */
  mappingConditions: co.wrap(function*(){
   var mappingChooseIndex = yield busFactory.mappingChooseIndex(this.subjectId)
   console.log(mappingChooseIndex,'===mappingChooseIndex==')
  this.setData({
    loadSuccess: true,
    ...mappingChooseIndex
  })

  }),
  
  onShow: function () {
   
  },

  onHide: function () {
    busFactory.removeAllData()
  },

  onUnload: function() {
    busFactory.removeAllData()
  },

  onPullDownRefresh: function () {

  },

  onShareAppMessage: function () {

  }
})