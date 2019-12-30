"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, storage, wxNav } from '../../../../utils/common_import'
import api from '../../../../network/restful_request'
Page({
  data: {
    showSelector: false,
    writeList: [],
    grades: [],
    // types: [],
    currentGrade: null,
    // currentType: null,
    // showTip: false,
    checkCount: 0,
    allCheck: false,
    loadReady: false,
    isEmpty: false
  },
  onLoad: co.wrap(function*(options) {
    this.weToast = new app.weToast()
      // if (options.scene) {
      //   let fromScene = decodeURIComponent(options.scene)
      //   let scene = fromScene.split('_')
      //   if (scene[0] === 'application') {
      //     this.share_user_id = scene[1]
      //     this.way = 5
      //   }
      // }
    let showIntro = storage.get('hasViewCnWrite')
    this.setData({
      showIntro: showIntro ? false : true
    })
    this.page = 1
    this.pageSize = 20
    if (showIntro) {
      let filterInfo = yield this.getFilters()
      if (filterInfo.hasFilter) {
        this.getWriteList()
      }
    }
  }),
  startWrite: co.wrap(function*() {
    // let unionId = wx.getStorageSync('unionId')
    // console.log('应用二维码参数传参', this.share_user_id, this.way)
    // if (unionId) {
    storage.put('hasViewCnWrite', true)
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
  // navTap(e) {
  //   let type = e.currentTarget.id
  //   this.setData({
  //     currentType: type,
  //   })
  //   this.resetData()
  // },
  selectorItemCheck(e) {
    let index = e.currentTarget.id
    this.setData({
      currentGrade: this.data.grades[index]
    })
    this.resetData()
  },
  resetData(){
    this.page = 1
    this.pageEnd = false
    this.setData({
      // allCheck: false,
      isEmpty: false,
      writeList: []
    })
    this.getWriteList()
  },
  // checkUnit(e) {
  //   let index = e.currentTarget.id,
  //     listLen = this.data.writeList.length,
  //     oldCheckFlag = this.data.writeList[index].isCheck,
  //     checkCount = this.data.checkCount
  //   checkCount = oldCheckFlag ? checkCount - 1 : checkCount + 1
  //   let allCheck = checkCount === listLen ? true : false
  //   this.setData({
  //     [`writeList[${index}].isCheck`]: !oldCheckFlag,
  //     allCheck,
  //     checkCount
  //   })
  // },
  // allCheck() {
  //   let writeList = this.data.writeList,
  //     allCheck = !this.data.allCheck,
  //     checkCount = allCheck ? writeList.length : 0
  //   for (let i = 0; i < writeList.length; i++) {
  //     writeList[i].isCheck = allCheck
  //   }
  //   this.setData({
  //     writeList,
  //     checkCount,
  //     allCheck
  //   })
  // },
  ctrlSelector() {
    this.setData({
      showSelector: !this.data.showSelector
    })
  },
  // ctrlTip() {
  //   this.setData({
  //     showTip: !this.data.showTip
  //   })
  // },
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
      sns: JSON.stringify(sns),
      type: type
    })
  },
  onReachBottom() {
    if (this.pageEnd) return
    this.getWriteList()
  },
  getFilters: co.wrap(function*() {
    this.weToast.toast({
      type:'loading'
    })
    try {
      let grades = yield this.getGrades(),
        currentGrade = grades[0]
      this.setData({
        currentGrade,
        grades
      })
      this.weToast.hide()
      return {
        hasFilter: true
      }
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
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
      type:'loading'
    })
    try {
      let stageSn = this.data.currentGrade.sn,
        page = this.page++;
      let resp = yield api.getWriteList('cn', stageSn, page)
      if (resp.code !== 0) {
        throw (resp)
      }
      let currentWriteList = this.data.writeList,
        tempData = resp.res,
        isEmpty = page === 1 && tempData.length === 0
      this.pageEnd = tempData.length < this.pageSize ? true : false
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