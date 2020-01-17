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
    loadReady: false,
    topBarHeight: 0,
    tabId: 'tab_0',
    typeId: '',
    paperTypes: [],
    showFilter: false,
    activeFilter: {},
    activeArea: {},
    activeGrade: {},
    activeYear: {
      id: 0,
      name: '全部'
    },
    years: [{
      id: 0,
      name: '全部'
    }, {
      id: 2020,
      name: '2020年'
    }, {
      id: 2019,
      name: '2019年'
    }, {
      id: 2018,
      name: '2018年'
    }, {
      id: 2017,
      name: '2017年'
    }, {
      id: 2016,
      name: '2016年'
    }, {
      id: 2015,
      name: '更早时间'
    }],
    activeFilterList: [],
    areas: [],
    paperList: [],
    grades: []
  },
  onLoad: co.wrap(function* (query) {
    this.weToast = new app.weToast()
    this.thematic = 0
    this.thematic = query.thematic ? Number(query.thematic) : 0
    this.subjectId = Number(query.id)
    this.setData({
      topBarHeight: app.navBarInfo.topBarHeight
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
      },
      upId = id.slice(0, 1).toUpperCase() + id.slice(1)
    if (!id) {
      this.setData(dataObj)
      return
    }
    this.showFilterType = id ? id : this.showFilterType
    dataObj.activeFilter = this.data['active' + upId]
    dataObj.activeFilterList = this.data[id + 's']
    this.setData(dataObj)
  },
  // 切换过滤
  changeFilter(e) {
    let index = e.currentTarget.dataset.index,
      dataObj = {
        loadReady: false
      },
      upFilterType = this.showFilterType.slice(0, 1).toUpperCase() + this.showFilterType.slice(1)
    dataObj['active' + upFilterType] = this.data[this.showFilterType + 's'][index]
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
      tabId,
      loadReady: false
    })
    this.resetGetPapers()
  },
  // 跳转详情
  toDetail(e) {
    if (app.preventMoreTap(e)) return
    let index = e.currentTarget.dataset.index,
      currentPaper = this.data.paperList[index],
      hasReport = Number(currentPaper.isReport),
      name = currentPaper.title,
      id = currentPaper.paperId,
      sn = currentPaper.sn
    wxNav.navigateTo('../preview/index', {
      id: id,
      hasReport: hasReport,
      name: name,
      subjectId: this.subjectId,
      sn: sn
    })
  },

  // 获取试卷版本
  getSubjectAreasAndGrades: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gqlSubject.getSubjectAreasAndGrades(),
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
      let res = yield gqlSubject.getSubjectPaperTypes(this.subjectId, this.thematic),
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
      let res = yield gqlSubject.getSubjectPapers(this.subjectId, this.data.typeId, this.data.activeGrade.id, this.data.activeArea.id, this.data.activeYear.id, this.page++),
        paperList = res.xuekewang.paperLists
      if (paperList.length < 20) {
        this.isEnd = true
      }
      this.setData({
        loadReady: true,
        paperList: this.data.paperList.concat(res.xuekewang.paperLists)
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
    this.setData({
      paperList: []
    })
    this.getSubjectPapers()
  },

  // 上拉刷新
  onReachBottom() {
    if (this.isEnd) return
    this.getSubjectPapers()
  }
})