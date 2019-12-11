"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'
Page({
  data: {
    showGuide: false,
    templates: [],
    guidePosition: {},
    loadReady: false,
    printerAlias: '3nfe8xk3b6vew',
    appId: 'wxde848be28728999c',
    shopId: 24056376
  },
  onLoad: co.wrap(function*(query) {
    this.weToast = new app.weToast()
    this.categorySn = query.sn
    this.hasViewCongnitionTpl = storage.get('hasViewCongnitionTpl')
    yield this.getCognitionTemplates()
  }),
  toShopping: function(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    wxNav.navigateTo(
      `/pages/cart/transit/transit?pageType=goodsDetail&goodsId=${this.data.printerAlias}&openId=${app.openId}&shopId=${this.data.shopId}&appId=${this.data.appId}`
    )
  },
  getCognitionTemplates: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getTemplates(this.categorySn)
      this.weToast.hide()
      this.setData({
        templates: res.category.templates,
        loadReady: true
      })

    } catch (error) {
      this.weToast.hide()
      util.showGraphqlErr(error)
    }
  }),
  drawGuideView(e) {
    let index = Number(e.currentTarget.id)
    if (index === 1 && !this.hasViewCongnitionTpl) {
      let query = wx.createSelectorQuery()
      query.select('.box-container').boundingClientRect()
      query.exec(res => {
        let temp = res[0]
        let guidePosition = {
          width: temp.width,
          height: temp.height,
          left: temp.left - 6,
          top: temp.top - 6
        }
        this.setData({
          guidePosition: guidePosition,
          showGuide: true
        })
        storage.put('hasViewCongnitionTpl', true)
      })
    }

  },
  hideGuideView() {
    this.setData({
      showGuide: false
    })
  },
  toEdit(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    let sn = e.currentTarget.id,
      editUrl = e.currentTarget.dataset.url
    wxNav.navigateTo(
      `../edit/index`, {
        sn,
        type: 'template',
        hasEdit: 0
      }
    )
  }
})