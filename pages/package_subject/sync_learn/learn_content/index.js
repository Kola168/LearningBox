// pages/package_subject/sync_learn/learn_content/index.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
const request = util.promisify(wx.request)
import graphql from '../../../../network/graphql/subject'
import {
  getLogger
} from '../../../../utils/logger'
const logger = new getLogger('pages/package_subject/sync_learn/learn_content/learn_content')
import busFactory from '../busFactory'
Page({

  data: {
    textbookPercentage: null,
    showSelectedText: false, //是否显示教材
    selectedBookVersionIndex: -1, //教材版本选中下标
    selectedTeachIndex: -1, //教材选中下标
    gradeList: [], //年级列表
    currentTabIndex: 0, //当前选中的学科index
    subjectList: [], //学科列表
    textbookVersion: [], //学科版本
    teachBook: [], //教材
    subjectSn: null, //学科sn
    selectedTextbookVersion: false, //当前学科是否包含选中的教材版本
    selectedTextbook: false, //当前学科是否包含选中的教材
    loadSuccess: false, //是否将数据请求完成
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function *(options) {
    this.longToast = new app.weToast()
    var index = options.index != null ? options.index : 0
    this.setData({
      currentTabIndex: index
    })
    yield this.getSubjectList()

    if (this.data.subjectList.length) {
      var subjectIndex = this.data.currentTabIndex
      busFactory.sendRequestIds('subjectSn', this.data.subjectList[subjectIndex].sn)
      this.subjectSn = busFactory.getIds('subjectSn')
      this.updateConditionData()
    }
  }),


  touchShowText: function() {
    this.setData({
      showSelectedText: !this.data.showSelectedText
    })
    this.setSelectedTab()
  },

  /**
   * 赋值默认选中的选择器值
   */
  setSelectedTab: co.wrap(function*() {
    if (this.data.showSelectedText || this.touchTexkbook) {
      return 
    }
    // 未进行教材选择， 重新拉取初始服务端数据 进行匹配
    if (!this.touchTexkbook) { 
      yield this.updateSelectedData()  //更新筛选器信息
    }

  }),

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
    this.touchTexkbook = null //状态释放
    this.versionSn = this.data.textbookVersion[index].sn
    busFactory.sendRequestIds('versionSn', this.versionSn)
    busFactory.removeTextbookData() //移除当前科目下教材缓存列表
    busFactory.removeCurrentSelectedTextbookData(this.subjectSn) //移除当前默认选中的教材数据
    yield this.getTeachBook()
  }),

  /**
   * 选择教材
   * @param {} param
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
      
      this.touchTexkbook = true //用户选择了教材
      this.textbookSn = this.data.teachBook[index].sn

      busFactory.getComponentsChapterDataFn([]) //清空章节列表
      busFactory.sendRequestIds('textbookSn', this.textbookSn) //设置教材id缓存
      busFactory.removeSelectedCurrentData(this.subjectSn) //移除当前默认选中的教材数据和教材版本
      busFactory.removeCurrentChapterList(this.subjectSn) //更新了教材 移除默认缓存章节数据
      if (this.textbookSn) {
        yield busFactory.sendGetChapter(this.subjectSn, this.textbookSn) // 发送章节数据请求
      }
      this.longToast.hide()
    } catch(err) {
      logger.info(err)
      this.longToast.hide()
    }
  }),

  /**
   * 选择学科
   * @param {*} param
   */
  chooseSubject: co.wrap(function *({currentTarget: {dataset: {index}}}) {
    var subjectSn =  this.data.subjectList[index].sn
    this.setData({
      currentTabIndex: index
    })
    this.subjectSn = subjectSn
    this.versionSn = null
    this.textbookSn = null 
    yield this.updateConditionData() //学科下所有数据节点更新
  }),

  /**
   * 选择教材组件内传入
   */
  chooseComponentTextbook: co.wrap(function*(){
    try {
      this.versionSn = busFactory.getIds('versionSn')
      this.textbookSn =  busFactory.getIds('textbookSn')
      this.longToast.toast({
        title: '请稍后...',
        type: 'loading'
      })
      busFactory.removeSelectedCurrentData(this.subjectSn) //移除上一次选择的值
      yield this.updateSelectedData() //更新筛选器信息
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
        subjectSn: this.subjectSn,
        loadSuccess: false, //重置组件显示状态
        selectedTextbookVersion: false, //当前学科是否包含选中的教材版本
        selectedTextbook: false, //当前学科是否包含选中的教材
      })
      this.longToast.toast({
        title: '请稍后...',
        type: 'loading'
      })
      busFactory.getComponentsChapterDataFn([]) //清空章节列表
      yield this.updateSelectedData() //更新筛选器信息
      if (this.textbookSn) {
        yield busFactory.sendGetChapter(this.subjectSn, this.textbookSn) // 初始化章节列表组件数据
      }
      this.longToast.hide()
    } catch(err) {
      this.longToast.hide()
    }
  }),

  /**
   * //更新筛选器信息
   */
  updateSelectedData: co.wrap(function*(){
    yield this.getSelectedTextbookVersion() //获取当前科目下选中教材版本
    yield this.getTextbookVersion() //获取当前学科所有教材版本
    yield this.getTeachBook() //获取学科下所有教材
    yield this.getSelectedTextbook() //获取当前科目下选中教材
    yield this.mappingConditions() //同步匹配默认筛选项
    yield this.getSyncExercisePrecent() //获取当前教材下用户学习的进度
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
      var resp = yield busFactory.getTextbookVersionData(this.subjectSn)
      this.setData({
        textbookVersion: resp.xuekewang.textbookVersions
      })
      if (!this.versionSn) {
        busFactory.sendRequestIds('versionSn', resp.xuekewang.textbookVersions[0].sn)
        this.versionSn = resp.xuekewang.textbookVersions[0].sn
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
      var resp = yield busFactory.getTextbookData(this.versionSn)
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
      var resp = yield busFactory.getSelectedTextbookData(this.subjectSn)
      this.setData({
        selectedTextbook: resp.xuekewang && resp.xuekewang.selectedTextbook
      })
      if (resp.xuekewang) {
        this.textbookSn = resp.xuekewang.selectedTextbook && resp.xuekewang.selectedTextbook.sn
        busFactory.sendRequestIds('textbookSn', this.textbookSn)
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
      var resp = yield busFactory.getSelectedTextbookVersionData(this.subjectSn)
      this.setData({
        selectedTextbookVersion: resp.xuekewang && resp.xuekewang.selectedTextbookVersion,
      })
      if (resp.xuekewang && resp.xuekewang.selectedTextbookVersion) {
        this.versionSn = resp.xuekewang.selectedTextbookVersion.sn
        busFactory.sendRequestIds('versionSn', this.versionSn)
      }
    }catch(err) {
      this.setData({
        selectedTextbookVersion: false
      })
      util.showError(err)
    }
  }),

  /**
   * 匹配当前学科下默认选中索引集合 教材版本 & 教材 两个数据的index
   */
  mappingConditions: co.wrap(function*(){
    var mappingChooseIndex = yield busFactory.mappingChooseIndex(this.subjectSn)
    this.setData({
      loadSuccess: true,
      ...mappingChooseIndex
    })

  }),

  getSyncExercisePrecent: co.wrap(function*(){
    try {
      var resp = yield graphql.getSyncExercisePrecent(this.textbookSn)
      this.setData({
        textbookPercentage: resp.xuekewang && resp.xuekewang.textbookPercentage,
      })
     
    }catch(err) {
      util.showError(err)
    }
  }),

  onHide: function () {
    busFactory.removeAllData()
  },

  onUnload: function() {
    // busFactory.removeDestoryData()
    busFactory.removeAllData()
  },

  onPullDownRefresh: function () {

  },
})