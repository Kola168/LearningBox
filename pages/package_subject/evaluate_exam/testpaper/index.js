"use strict"
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from "../../../../utils/common_import"
import gqlSubject from '../../../../network/graphql/subject'
Page({
  data: {
    topBarHeight: 0,
    tabId: 'tab_0',
    typeId: '',
    paperTypes: [],
    showFilter: false,
    activeFilter: {},
    activeArea: {},
    activeGrade: {
      sn: 1,
      name: '七年级'
    },
    areas: [],
    paperList: [],
    grades: [{
      sn: 1,
      name: '一年级'
    }, {
      sn: 2,
      name: '二年级'
    }, {
      sn: 3,
      name: '三年级'
    }, {
      sn: 4,
      name: '四年级'
    }, {
      sn: 5,
      name: '五年级'
    }]
  },
  onLoad: co.wrap(function* (query) {
    this.weToast = new app.weToast()
    this.subjectId = Number(query.id)
    this.setData({
      topBarHeight: app.navBarInfo.topBarHeight + 50
    })
    yield this.getSubjectAreas()
    yield this.getSubjectPaperTypes()
    this.resetGetPapers()
  }),

  // 显示版本或年级选择
  showFilter(e) {
    let id = e.currentTarget.id,
      dataObj = {
        showFilter: !this.data.showFilter
      }

    this.showFilterType = id ? id : this.showFilterType
    if (id === 'area') {
      dataObj.activeFilter = this.data.activeArea
    } else if (id === 'grade') {
      dataObj.activeFilter = this.data.activeGrade
    }
    this.setData(dataObj)
  },
  // 切换过滤
  changeFilter(e) {
    let index = e.currentTarget.dataset.index,
      dataObj = {}
    if (this.showFilterType === 'area') {
      dataObj.activeArea = this.data.areas[index]
    } else if (this.showFilterType === 'grade') {
      dataObj.activeGrade = this.data.grades[index]
    }
    this.setData(dataObj)
    this.resetGetPapers()
  },
  // 切换试卷类型
  changeType(e) {
    this.page = 1
    this.isEnd = false
    let tabId = e.currentTarget.id,
      typeId = e.currentTarget.dataset.id
    this.setData({
      typeId: Number(typeId),
      tabId
    })
    this.resetGetPapers()
  },
  // 跳转详情
  toDetail(e) {
    if (app.preventMoreTap(e)) return
    let index = e.currentTarget.dataset.index,
      currentPaper = this.data.paperList[index],
      hasReport = currentPaper.isReport,
      name = currentPaper.title,
      id = currentPaper.paperId
    wxNav.navigateTo('../preview/index', {
      id: id,
      hasReport: hasReport,
      name: name
    })
  },

  // 获取试卷版本
  getSubjectAreas: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gqlSubject.getSubjectAreas(this.subjectId),
        tempAreas = res.xuekewang.areas,
        areas = []
      for (let i = 0; i < tempAreas.length; i++) {
        let area = {
          id: tempAreas[i].areaId,
          name: tempAreas[i].areaName
        }
        areas.push(area)
      }
      this.setData({
        areas,
        activeArea: areas[0]
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 获取试卷类型
  getSubjectPaperTypes: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gqlSubject.getSubjectPaperTypes(this.subjectId),
        paperTypes = res.xuekewang.paperTypes
      this.setData({
        paperTypes: paperTypes,
        typeId: paperTypes[0].id
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  // 获取试卷
  getSubjectPapers: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gqlSubject.getSubjectPapers(this.subjectId, this.data.typeId, this.data.activeArea.id, this.page++),
        paperList = res.xuekewang.paperLists
      console.log(paperList.length)
      if (paperList.length < 20) {
        this.isEnd = true
      }
      this.setData({
        paperList: res.xuekewang.paperLists
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  // 重置获取试卷
  resetGetPapers() {
    this.page = 1
    this.isEnd = false
    this.getSubjectPapers()
  },

  // 上拉刷新
  onReachBottom() {
    if (this.isEnd) return
    this.getSubjectPapers()
  }
})