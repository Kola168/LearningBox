"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'
Page({
  data: {
    tabId: 'tab_0',
    contentTypes: [],
    typeContents: []
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.sn = query.sn
    this.getFreeSourcesContentType()
  },
  getFreeSourcesContentType: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getFreeSourcesContentType(this.sn)
      let contentTypes = res.category.children
      this.setData({
        contentTypes
      })
      this.typeSn = contentTypes[0].sn
      this.getFreeSourcesContents()
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  getFreeSourcesContents: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getFreeSourcesContents(this.typeSn)
      this.setData({
        typeContents: res.category.contents
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  changeType(e) {
    let tabId = e.currentTarget.id
    this.typeSn = e.currentTarget.dataset.sn
    this.setData({
      tabId
    })
    this.getFreeSourcesContents()
  },
  toNext(e) {
    if (app.preventMoreTap(e)) return
    let sn = e.currentTarget.dataset.sn
    wxNav.navigateTo(`../detail/index`, {
      sn
    })
  }
})