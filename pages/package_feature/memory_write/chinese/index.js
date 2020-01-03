"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, storage, wxNav } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/feature'
Page({
  data: {
    showSelector: false,
    writeList: [],
    grades: [],
    currentGrade: null,
    topBarHeight: 0,
    checkCount: 0,
    allCheck: false,
    loadReady: false,
    isEmpty: false,
    isFullScreen: false
  },
  onLoad: co.wrap(function*(query) {
    this.weToast = new app.weToast()
    this.sn = query.sn
    let showIntro = storage.get('hasViewCnWrite')
    this.setData({
      isFullScreen: app.isFullScreen,
      showIntro: showIntro ? false : true,
      topBarHeight: app.navBarInfo.topBarHeight
    })
    if (showIntro) {
      yield this.getGrades()
      yield this.getWriteList()
    }
  }),
  startWrite: co.wrap(function*() {
    storage.put('hasViewCnWrite', true)
    this.setData({
      showIntro: false
    })
    yield this.getGrades()
    this.getWriteList()
  }),
  selectorItemCheck(e) {
    let index = e.currentTarget.id,
      currentGrade = this.data.grades[index]
    this.setData({
        currentGrade
      })
    this.resetData()
  },
  resetData() {
    this.setData({
      allCheck: false,
      isEmpty: false,
      writeList: []
    })
    this.getWriteList()
  },
  checkUnit(e) {
    let index = e.currentTarget.id,
      listLen = this.data.writeList.length,
      oldCheckFlag = this.data.writeList[index].isCheck,
      checkCount = this.data.checkCount
    checkCount = oldCheckFlag ? checkCount - 1 : checkCount + 1
    let allCheck = checkCount === listLen ? true : false
    this.setData({
      [`writeList[${index}].isCheck`]: !oldCheckFlag,
      allCheck,
      checkCount
    })
  },
  allCheck() {
    let writeList = this.data.writeList,
      allCheck = !this.data.allCheck,
      checkCount = allCheck ? writeList.length : 0
    for (let i = 0; i < writeList.length; i++) {
      writeList[i].isCheck = allCheck
    }
    this.setData({
      writeList,
      checkCount,
      allCheck
    })
  },
  ctrlSelector() {
    this.setData({
      showSelector: !this.data.showSelector
    })
  },

  toPrint(e) {
    let sns = [],
      type = ''
    if (e.currentTarget.id) {
      sns.push(e.currentTarget.id)
      type = 'pdf'
    } else {
      this.weToast.toast({
        type: 'loading'
      })
      type = 'html'
      let writeList = this.data.writeList
      for (let i = 0; i < writeList.length; i++) {
        if (writeList[i].isCheck) {
          sns.push(writeList[i].sn)
        }
      }
      this.weToast.hide()
    }
    wxNav.navigateTo('../chinese/print', {
      sns: encodeURIComponent(JSON.stringify(sns))
    })
  },
  getGrades: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getStages(this.sn),
        grades = res.userStages,
        currentGrade = grades[0]
      this.setData({
        currentGrade,
        grades
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  getWriteList: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let categorys = this.data.currentGrade.guessWriteCategories
      if (categorys.length === 0) {
        this.setData({
          isEmpty
        })
        this.weToast.hide()
        return
      }
      let resp = yield graphql.getWriteList(categorys[0].sn),
        writeList = resp.category.children,
        isEmpty = writeList.length >= 0 ? false : true
      if (isEmpty) {
        this.setData({
          isEmpty
        })
        return
      } else {
        let checkFlag = this.data.allCheck ? true : false
        for (let i = 0; i < writeList.length; i++) {
          writeList[i].isCheck = checkFlag
        }
        this.setData({
          writeList,
          isEmpty,
          loadReady: true
        })
      }
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
})