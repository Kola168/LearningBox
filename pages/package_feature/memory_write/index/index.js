const app = getApp()
import { regeneratorRuntime, wxNav, co, util } from "../../../../utils/common_import"
import graphql from '../../../../network/graphql/feature'

Page({
  data: {
    loadReady: false,
    category: []
  },
  onLoad() {
    this.weToast = new app.weToast()
    this.getCategory()
  },
  toNext(e) {
    let sn = e.currentTarget.id,
      type = e.currentTarget.dataset.type,
      pageKey = type === 'en' ? 'english' : 'chinese'
    wxNav.navigateTo(`../${pageKey}/index`, {
      sn: sn
    })
  },
  getCategory: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getCategory('guess_write')
      this.setData({
        loadReady: true,
        category: res.feature.categories
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})