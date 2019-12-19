"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'
const PRINT_LIMIT = 30
Page({
  data: {
    isFullScreen: false,
    windowHeight: 0,
    current: 0,
    sources: [],
    showPrintSetting: false,
    printCount: 1,
    pageCount: 1,
    startPage: 1,
    endPage: 1,
    title: '',
    grayscale: false, //是否灰度打印
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    }
  },

  onLoad(query) {
    this.weToast = new app.weToast()
    this.sn = query.sn
    let isFullScreen = app.isFullScreen
    this.setData({
      isFullScreen,
      windowHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight - (isFullScreen ? 30 : 0)
    })
    this.getFreeSourcesDetail()
  },
  getFreeSourcesDetail: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getFreeSourcesDetail(this.sn),
        content = res.content
      this.setData({
        sources: content.contentImages,
        pageCount: content.pageCount,
        endPage: content.pageCount,
        title: content.title
      })
      this.featureKey = content.featureKey
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  swpierChange(e) {
    if (e.detail.source === 'touch') {
      this.setData({
        current: e.detail.current
      })
    }
  },
  // 翻页
  pageTurn(e) {
    let direction = e.currentTarget.id,
      current = this.data.current
    if (direction === 'left') {
      if (current !== 0) {
        this.setData({
          current: current - 1
        })
      }
    } else {
      let sourcesLen = this.data.sources.length
      if (current < sourcesLen - 1) {
        this.setData({
          current: current + 1
        })
      }
    }
  },
  // 改变份数
  changeCount(e) {
    if (app.preventMoreTap(e)) return
    let type = e.currentTarget.id,
      printCount = this.data.printCount
    if (type === 'plus') {
      if (printCount >= PRINT_LIMIT) {
        wx.toast({
          title: '一次最多打印30份',
          icon: 'none'
        })
      } else {
        this.setData({
          printCount: printCount + 1
        })
      }
    } else {
      if (printCount > 1) {
        this.setData({
          printCount: printCount - 1
        })
      }
    }
  },
  // 获取打印范围
  getStartPage(e) {
    this.startPage = Number(e.detail.value)
  },
  judeStartPage() {
    let startPage = this.startPage
    if (this.startPage === 0 || this.startPage > this.data.endPage) {
      wx.showToast({
        title: '请输入正确的开始页',
        icon: 'none'
      })
      startPage = 1
    }
    this.setData({
      startPage
    })
  },
  getEndPage(e) {
    console.log(e)
    this.endPage = Number(e.detail.value)
  },
  judeEndPage() {
    let endPage = this.endPage
    if (this.endPage < this.data.startPage || this.endPage > this.data.pageCount) {
      wx.showToast({
        title: '请输入正确的结束页',
        icon: 'none'
      })
      endPage = this.data.pageCount
    }
    this.setData({
      endPage
    })
  },
  // 色彩选择
  changePrintColor(e) {
    let grayscale = Boolean(Number(e.currentTarget.dataset.flag))
    this.setData({
      grayscale
    })
  },
  // 是否显示打印设置
  showPrintSetting() {
    this.setData({
      showPrintSetting: !this.data.showPrintSetting
    })
  },
  // 打印
  print() {
    let hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.userConfirm()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  },
  userConfirm: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let params = {
        featureKey: this.featureKey,
        resourceAttribute: {
          sn: this.sn,
          copies: this.data.printCount,
          startPage: this.data.pageCount === 1 ? 1 : this.data.startPage,
          endPage: this.data.pageCount === 1 ? 1 : this.data.endPage,
          grayscale: this.data.grayscale,
          resourceType: 'Content'
        }
      }
      let res = yield graphql.createResourceOrder(params)
      if (resp.createResourceOrder.state === 'finished') {
        console.log(res)
      }
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})