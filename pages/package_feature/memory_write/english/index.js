"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/feature'
Page({
  data: {
    showSelector: false,
    writeList: [],
    currentFilters: [],
    currentGrade: null,
    currentMaterial: null,
    selectorType: null,
    allCheck: false,
    checkCount: 0,
    loadReady: false,
    showIntro: false,
    isEmpty: false,
    topBarHeight: 0,
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
      yield this.getFilters()
      if(this.materials.length>0){
        this.getWriteList()
      }
    }
  }),
  startWrite: co.wrap(function*() {
    storage.put('hasViewEnWrite', true)
    this.setData({
      showIntro: false
    })
    yield this.getFilters()
    if(this.materials.length>0){
      this.getWriteList()
    }
  }),
  ctrlSelector(e) {
    let type = e.currentTarget.id,
      isShowSelector = this.data.showSelector,
      dataObj = {}
    if (type) {
      type = e.currentTarget.id
      if (type === 'materials') {
        dataObj.currentFilters = this.materials
        dataObj.selectorType = 'materials'
      } else if (type === 'grades') {
        dataObj.currentFilters = this.grades
        dataObj.selectorType = 'grades'
      }
      dataObj.showSelector = true
    } else {
      dataObj.showSelector = !isShowSelector
    }
    this.setData(dataObj)
  },
  selectorItemCheck: co.wrap(function*(e) {
    let index = e.currentTarget.id
    let dataObj = {
      writeList: [],
      isEmpty: false,
      allCheck: false
    }
    if (this.data.selectorType === 'materials') {
      dataObj.currentMaterial = this.materials[index]
    } else {
      dataObj.currentGrade = this.grades[index]
      if (this.grades[index].guessWriteCategories.length === 0) {
        this.setData(dataObj)
        return
      }
      dataObj.currentMaterial = this.grades[index].guessWriteCategories[0]
      this.materials = this.grades[index].guessWriteCategories
    }
    this.setData(dataObj)
    this.getWriteList()
  }),
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
  toPrint() {
    this.weToast.toast({
      type: 'loading'
    })
    let writeList = this.data.writeList,
      sns = []
    for (let i = 0; i < writeList.length; i++) {
      if (writeList[i].isCheck) {
        sns.push(writeList[i].sn)
      }
    }
    this.weToast.hide()
    wxNav.navigateTo('../english/print', {
      sns: encodeURIComponent(JSON.stringify(sns))
    })
  },
  getFilters: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getStages(this.sn),
        grades = res.userStages,
        currentGrade = grades[0],
        materials = currentGrade.guessWriteCategories,
        currentMaterial = materials[0] ? materials[0] : []
      this.materials = materials
      this.grades = grades
      this.setData({
        currentMaterial,
        currentGrade
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
      let resp = yield graphql.getWriteList(this.data.currentMaterial.sn),
        writeList = resp.category.children,
        isEmpty = writeList.length >= 0 ? false : true
      this.weToast.hide()
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
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
})