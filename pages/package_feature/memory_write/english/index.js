"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import api from '../../../../network/restful_request'
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
    isEmpty: false
  },
  onLoad: co.wrap(function*(options) {
    // if (options.scene) {
    //   let fromScene = decodeURIComponent(options.scene)
    //   let scene = fromScene.split('_')
    //   if (scene[0] === 'application') {
    //     this.share_user_id = scene[1]
    //     this.way = 5
    //   }
    // }
    let showIntro = storage.get('hasViewEnWrite')
    this.setData({
      showIntro: showIntro ? false : true
    })
    this.pageSize = 20
    this.page = 1
    if (showIntro) {
      let filterInfo = yield this.getFilters()
      if (filterInfo.hasFilter) {
        this.getWriteList()
      }
    }
  }),
  startWrite: co.wrap(function*() {
    let unionId = storage.get('unionId')
      // console.log('应用二维码参数传参', this.share_user_id, this.way)
      // if (unionId) {
    storage.put('hasViewEnWrite', true)
    this.setData({
      showIntro: false
    })
    let filterInfo = yield this.getFilters()
    if (filterInfo.hasFilter) {
      this.getWriteList()
    }
    // } else {
    //   let url = this.share_user_id ? `/pages/authorize/index?share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
    //   wx.navigateTo({
    //     url: url,
    //   })
    // }
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
  selectorItemCheck(e) {
    let index = e.currentTarget.id
    this.page = 1
    this.pageEnd = false
    let dataObj = {
      writeList: [],
      isEmpty: false,
      allCheck: false
    }
    if (this.data.selectorType === 'materials') {
      dataObj.currentMaterial = this.materials[index]
    } else {
      dataObj.currentGrade = this.grades[index]
    }
    this.setData(dataObj)
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
    wx.navigateTo({
      url: `./print?sns=${JSON.stringify(sns)}`
    })

  },
  onReachBottom() {
    if (this.pageEnd) return
    this.getWriteList()
  },
  getFilters: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let materials = yield this.getMaterials(),
        grades = yield this.getGrades(),
        currentMaterial = materials[0],
        currentGrade = grades[0]
      this.materials = materials
      this.grades = grades
      this.setData({
        currentMaterial,
        currentGrade
      })
      return {
        hasFilter: true
      }
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  getMaterials: co.wrap(function*() {
    let resp = yield api.getEnglishWritesMaterials()
    if (resp.code !== 0) {
      throw (resp)
    }
    return resp.res
  }),
  getGrades: co.wrap(function*() {
    let resp = yield api.getWritesGradess()
    if (resp.code !== 0) {
      throw (resp)
    }
    return resp.res
  }),
  getWriteList: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let stageSn = this.data.currentGrade.sn,
        outer = this.data.currentMaterial.sn,
        page = this.page++;
      let resp = yield api.getWriteList('en', stageSn, outer, page)
      if (resp.code !== 0) {
        throw (resp)
      }

      let currentWriteList = this.data.writeList,
        tempData = resp.res,
        isEmpty = page === 1 && tempData.length === 0

      this.pageEnd = tempData.length < this.pageSize ? true : false
      let checkFlag = this.data.allCheck ? true : false
      for (let i = 0; i < tempData.length; i++) {
        tempData[i].isCheck = checkFlag
      }
      this.setData({
        writeList: currentWriteList.concat(tempData),
        loadReady: true,
        isEmpty
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
})