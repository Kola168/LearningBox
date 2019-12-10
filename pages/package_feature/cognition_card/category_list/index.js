"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import api from '../../../../network/restful_request'
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
    this.longToast = new app.weToast()
    this.categoryId = query.id
    this.page = 1
    this.pageEnd = false
    this.hasViewCongnitionTpl = wx.getStorageSync('hasViewCongnitionTpl')
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
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield api.getCognitionTemplates(app.openId, this.categoryId, this.page++)
      if (resp.code !== 0) {
        throw (resp)
      }
      let templates = resp.res
      if (templates.length < 20) {
        this.pageEnd = true
      }
      this.longToast.toast()
      if (templates.length === 0) {
        return
      }
      this.setData({
        templates: templates,
        loadReady: true
      })

    } catch (error) {
      this.longToast.toast()
      util.showErr(error)
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
    let id = e.currentTarget.id,
      editUrl = e.currentTarget.dataset.url
    wxNav.navigateTo(
      `../edit/index`, {
        templateId: id,
        type: 'template',
        hasEdit: 0,
        editUrl
      }
    )
  },
  onReachBottom: function() {
    if (this.pageEnd) {
      return
    }
    this.getCognitionTemplates()
  },
})