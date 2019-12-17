"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
Page({
  data: {
    tabId: 'tab_0'
  },
  changeType(e) {
    let tabId = e.currentTarget.id
    this.setData({
      tabId
    })
  },
  toNext(){
    wxNav.navigateTo(`../detail/index`)
  }
})