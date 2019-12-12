"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'
Page({
  data: {
    categoryList: [],
    // printerAlias: '3nfe8xk3b6vew',
    // appId: 'wxde848be28728999c',
    // shopId: 24056376,
    // showIntro: false,
    areaHeight: 0
  },
  onLoad: co.wrap(function*() {
    let navBarHeight = app.navBarInfo.navBarHeight
    this.setData({
      areaHeight: app.sysInfo.safeArea.height - navBarHeight
    })
    this.weToast = new app.weToast()
    yield this.getCognitionCategories()
  }),
  toShopping: function(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    wxNav.navigateTo(
      `/pages/cart/transit/transit?pageType=goodsDetail&goodsId=${this.data.printerAlias}&openId=${app.openId}&shopId=${this.data.shopId}&appId=${this.data.appId}`)
  },
  toNext: co.wrap(function*(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    try {
      let sn = e.currentTarget.dataset.sn,
        id = e.currentTarget.id,
        url = '',
        playload = {}
      if (id === 'custom') {
        let literacyCard = storage.get('literacy_card')
        let templateSn = yield this.getEmptyTemplateInfo(sn)
        if (literacyCard && literacyCard.length > 0) {
          let isFull = literacyCard.length >= 18 ? 1 : 0
          url = `../list/index`
          playload = {
            isFull,
            sn: templateSn
          }
        } else {
          url = `../edit/index`
          playload = {
            sn: templateSn,
            type: 'custom',
            hasEdit: 0,
            editUrl: ''
          }
        }
      } else {
        url = `../category_list/index`
        playload = {
          sn
        }
      }
      wxNav.navigateTo(
        url, playload
      )
    } catch (error) {
      util.showError(error)
    }

  }),
  getCognitionCategories: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getCategory('literacy_card')
      this.setData({
        categoryList: res.feature.categories
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showGraphqlErr(error)
    }
  }),
  getEmptyTemplateInfo: co.wrap(function*(sn) {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getTemplates(sn)
      this.weToast.hide()
      return res.category.templates[0].sn
    } catch (error) {
      this.weToast.hide()
      util.showGraphqlErr(error)
    }
  }),
})