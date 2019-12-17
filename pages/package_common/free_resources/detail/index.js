"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
Page({
  data: {
    isFullScreen: false,
    windowHeight: 0,
    current: 0,
    sources: [{
      url: 'https://cdn-h.gongfudou.com/tmp/2019/11/12/b7660a60-1cce-11ea-a645-0bb7b7a5fdc4-out.jpg'
    }, {
      url: 'https://cdn-h.gongfudou.com/tmp/2019/11/12/b7660a60-1cce-11ea-a645-0bb7b7a5fdc4-out.jpg'
    }]
  },

  onLoad() {
    setTimeout(() => {
      let isFullScreen = app.isFullScreen
      this.setData({
        isFullScreen,
        windowHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight - (isFullScreen ? 30 : 0)
      })
    }, 500)
  },
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
  }
})