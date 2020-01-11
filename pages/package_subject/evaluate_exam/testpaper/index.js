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
    activeGrade: {},
    activeFilterList: [],
    areas: [],
    paperList: [],
    grades: []
  },
  onLoad: co.wrap(function* (query) {
    this.weToast = new app.weToast()
    this.subjectId = Number(query.id)
    this.subjectSn = Number(query.sn)
    this.setData({
      topBarHeight: app.navBarInfo.topBarHeight + 50
    })
    yield this.getSubjectAreasAndGrades()
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
      dataObj.activeFilterList = this.data.areas
    } else if (id === 'grade') {
      dataObj.activeFilter = this.data.activeGrade
      dataObj.activeFilterList = this.data.grades
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
      id = currentPaper.paperId,
      sn = currentPaper.sn
    wxNav.navigateTo('../preview/index', {
      id: id,
      hasReport: hasReport,
      name: name,
      subjectSn: this.subjectSn,
      sn: sn
    })
  },

  // 获取试卷版本
  getSubjectAreasAndGrades: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gqlSubject.getSubjectAreasAndGrades(this.subjectId),
        tempAreas = res.xuekewang.areas,
        areas = [],
        grades = res.xuekewang.grades,
        selectedPaperSubject = res.xuekewang.selectedPaperSubject
      let activeArea = [],
        activeGrade = grades[0]
      for (let i = 0; i < tempAreas.length; i++) {
        let area = {
          id: tempAreas[i].areaId,
          name: tempAreas[i].areaName
        }
        areas.push(area)
        if (selectedPaperSubject) {
          if (tempAreas[i].areaId == selectedPaperSubject.areaId) {
            activeArea = {
              id: tempAreas[i].areaId,
              name: tempAreas[i].areaName
            }
          }
        }
      }
      if (selectedPaperSubject) {
        this.typeId = selectedPaperSubject.paperTypeId
        for (let i = 0; i < grades.length; i++) {
          if (grades[i].id == selectedPaperSubject.gradeId) {
            activeGrade = grades[i]
          }
        }
      } else {
        activeArea = areas[0]
      }
      this.setData({
        areas,
        grades,
        activeGrade,
        activeArea
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
        paperTypes = res.xuekewang.paperTypes,
        tabId = 'tab_0'
      for (let k = 0; k < paperTypes.length; k++) {
        if (this.typeId === paperTypes[k].id) {
          tabId = `tab_${k}`
        }
      }
      this.setData({
        paperTypes: paperTypes,
        tabId: tabId,
        typeId: this.typeId ? this.typeId : paperTypes[0].id
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
      let res = yield gqlSubject.getSubjectPapers(this.subjectId, this.data.typeId, this.data.activeGrade.id, this.data.activeArea.id, this.page++),
        paperList = res.xuekewang.paperLists
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