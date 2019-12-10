"use strict"
const app = getApp()
import wxNav from '../../../../utils/nav.js'
Page({
  data: {
    printerAlias: '3nfe8xk3b6vew',
    appId: 'wxde848be28728999c',
    shopId: 24056376,
    isFullScreen: false
  },
  onLoad() {
    this.setData({
      isFullScreen: app.isFullScreen
    })
  },
  toMake(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    wxNav.navigateTo('../category/index')
  },
  toShopping: function() {
    wxNav.navigateTo(`/pages/cart/transit/transit?pageType=goodsDetail&goodsId=${this.data.printerAlias}&openId=${app.openId}&shopId=${this.data.shopId}&appId=${this.data.appId}`)
  }
})