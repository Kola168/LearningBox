"use strict"
const app = getApp()
import { regeneratorRuntime, co, wxNav, util } from "../../../../utils/common_import"
import gqlSubject from '../../../../network/graphql/subject'
Page({
  data: {
    topBarHeight: 0,
    tabId: 'tab_0',
    typeSn: '',
    showFilter: false,
    activeFilter: {
      sn: 1,
      name: '江苏'
    },
    activeEdition: {
      sn: 1,
      name: '江苏'
    },
    activeGrade: {
      sn: 1,
      name: '七年级'
    },
    editions: [{
      sn: 1,
      name: '江苏'
    }, {
      sn: 2,
      name: '浙江'
    }, {
      sn: 3,
      name: '安徽'
    }, {
      sn: 4,
      name: '河南'
    }, {
      sn: 5,
      name: '上海'
    }],
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
    }],
    papersTypes: [{
      sn: 1,
      name: '全部'
    }, {
      sn: 2,
      name: '期中试卷'
    }, {
      sn: 3,
      name: '期末试卷'
    }, {
      sn: 4,
      name: '期中试卷'
    }, {
      sn: 5,
      name: '期末试卷'
    }, {
      sn: 6,
      name: '期中试卷'
    }, {
      sn: 7,
      name: '期末试卷'
    }]
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.subjectId = Number(query.id)
    this.setData({
      topBarHeight: app.navBarInfo.topBarHeight + 50
    })
    this.getSubjectEditions()
  },
  showFilter(e) {
    let id = e.currentTarget.id,
      dataObj = {
        showFilter: !this.data.showFilter
      }
    if (id === 'edition') {
      dataObj.activeFilter = this.data.activeEdition
    } else if (id === 'grade') {
      dataObj.activeFilter = this.data.activeGrade
    }
    this.setData(dataObj)
  },
  // 切换版本
  changeEdition(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      activeEdition: this.data.editions[index]
    })
  },
  // 切换试卷类型
  changeType(e) {
    let tabId = e.currentTarget.id,
      typeSn = e.currentTarget.dataset.sn
    this.setData({
        typeSn,
        tabId
      })
      // this.getTestpapers()
  },
  // 跳转详情
  toDetail(e) {
    if (app.preventMoreTap(e)) return
    let sn = e.currentTarget.dataset.sn
    wxNav.navigateTo('../../detail/index', {
      sn: sn
    })
  },

  // 获取试卷版本
  getSubjectEditions: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gqlSubject.getSubjectsVersions(this.subjectId)
      console.log(res)
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 获取试卷类型
  getTestpapersType: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getTestpapersType(this.data.activeEdition.sn)
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  // 获取试卷
  getTestpapers: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getTestpapers(this.data.typeSn)
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})