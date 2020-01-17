"use strict"
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../../../utils/common_import'
const event = require('../../../../lib/event/event')
import graphql from '../../../../network/graphql/common.js'
// const PRINT_LIMIT = 30
Page({
  data: {
    isFullScreen: false,
    windowHeight: 0,
    current: 0,
    sources: [],
    title: ''
  },

  onLoad(query) {
    this.weToast = new app.weToast()
    this.sn = query.sn
    let isFullScreen = app.isFullScreen
    this.setData({
      isFullScreen,
      windowHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight - (isFullScreen ? 30 : 0)
    })
    event.on('Authorize', this, () => {
      this.setData({
        isAuth: app.isScope()
      })
      this.getFreeSourcesDetail()
    })
    let isAuth = app.isScope()
    if (!isAuth) {
      return wxNav.navigateTo("/pages/authorize/index")
    } else {
      this.getFreeSourcesDetail()
    }
  },
  getFreeSourcesDetail: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getFreeSourcesDetail(this.sn),
        content = res.content
      this.setData({
        sources: content.contentImages,
        title: content.name,
        isCollect: false
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
  // 打印
  toSetting() {
    wxNav.navigateTo('/pages/package_common/setting/setting', {
      settingData: encodeURIComponent(JSON.stringify({
        file: {
          name: this.data.title,
        },
        orderPms: {
          printType: 'RESOURCE',
          pageCount: this.data.sources.length,
          featureKey: this.featureKey,
          mediaType: this.featureKey,
          resourceAttribute: {
            resourceType: 'Content',
            sn: this.sn
          }
        },
        checkCapabilitys: {
          isSettingDuplex: true,
          isSettingColor: true,
        }
      }))
    })
  },
  // 收藏
  collect: co.wrap(function* (e) {
    if (app.preventMoreTap(e)) return
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let action = this.data.isCollect ? 'destroy' : 'create'
      yield graphql.collect(this.sn, 'content', action)
      this.weToast.hide()
      let tipText = this.data.isCollect ? '取消收藏成功' : '收藏成功'
      wx.showToast({
        icon: 'none',
        title: tipText
      })
      this.setData({
        isCollect: !this.data.isCollect
      })
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  onShareAppMessage(res) {
    if (res.from === 'button' || res[0].from === 'button') {
      return {
        title: this.data.title,
        path: `/pages/package_common/free_resources/index/index?sn=${this.sn}`
      }
    } else {
      return app.share
    }
  },
  onUnload() {
    event.remove('Authorize', this)
  }
})