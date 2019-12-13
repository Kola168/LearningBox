"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
Page({
  minHeight: 0,
  onLoad() {
    this.setData({
      minHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight
    })
  },
  toNext(){
    wxNav.navigateTo(`../content/index`)
  }
})