"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'
Page({
  data: {
    isFullScreen: false,
    windowHeight: 0,
    current: 0,
    sources: [],
    printCount: 1
  },

  onLoad(query) {
    this.weToast = new app.weToast()
    this.sn = query.sn
    let isFullScreen = app.isFullScreen
    this.setData({
        isFullScreen,
        windowHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight - (isFullScreen ? 30 : 0)
      })
      // this.getFreeSourcesDetail()
  },
  getFreeSourcesDetail: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getFreeSourcesDetail(this.sn)
      this.setData({
        sources: res.content.contentImages
      })
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
      if (printCount >= 30) {
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
  }
})