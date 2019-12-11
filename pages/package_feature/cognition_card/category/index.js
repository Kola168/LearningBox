"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
import api from '../../../../network/restful_request'
Page({
  data: {
    categoryList: [{
      image: '../../images/category_0.png',
      id: 1
    }, {
      image: '../../images/category_1.png',
      id: 2
    }, {
      image: '../../images/category_2.png',
      id: 3
    }, {
      image: '../../images/category_3.png',
      id: 4
    }, {
      image: '../../images/category_4.png',
      id: 5
    }],
    printerAlias: '3nfe8xk3b6vew',
    appId: 'wxde848be28728999c',
    shopId: 24056376,
    showIntro: false,
    navBarHeight: 0,
    areaHeight: 0
  },
  onLoad: co.wrap(function*() {
    let navBarHeight = app.navBarInfo.navBarHeight
    this.setData({
      areaHeight: app.sysInfo.safeArea.height - navBarHeight
    })
    this.longToast = new app.weToast()
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
    let id = Number(e.currentTarget.id),
      url = '',
      playload = {}
    if (id === 5) {
      let literacyCard = wx.getStorageSync('literacy_card')
      let templateId = yield this.getEmptyTemplateId(id)

      if (literacyCard && literacyCard.length > 0) {
        let isFull = literacyCard.length >= 18 ? 1 : 0
        url = `../list/list`
        playload = {
          isFull,
          id: templateId
        }
      } else {
        url = `../edit/index`
        playload = {
          templateId,
          type: 'custom',
          hasEdit: 0,
          editUrl: ''
        }
      }
    } else {
      url = `../category_list/index`
      playload = {
        id
      }
    }
    wxNav.navigateTo(
      url, playload
    )
  }),
  getCognitionCategories: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield api.getCognitionCategories('oHTe45c3u5Y5xcUMd2Vw4c2SWjj4')
      if (resp.code != 0) {
        throw (resp)
      }
      this.setData({
        categoryList: resp.res
      })
      this.longToast.toast()
    } catch (error) {
      this.longToast.toast()
      util.showErr(error)
    }
  }),
  getEmptyTemplateId: co.wrap(function*(id) {
    wx.showLoading({
      title: '请稍等',
      mask: true
    })
    try {
      let resp = yield api.getCognitionTemplates(app.openId, id, 1)
      if (resp.code !== 0) {
        throw (resp)
      }
      wx.hideLoading()
      return resp.res[0].id
    } catch (error) {
      wx.hideLoading()
      util.showErr(error)
    }
  }),
})