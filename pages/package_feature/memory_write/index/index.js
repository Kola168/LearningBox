const app = getApp()
import { regeneratorRuntime, wxNav, co, util } from "../../../../utils/common_import"
import graphql from '../../../../network/graphql_request'

Page({
  data:{
    category:[]
  },
  onLoad() {
    this.weToast = new app.weToast()
    this.getCategory()
  },
  toNext(e) {
    let pageKey = e.currentTarget.id
    wxNav.navigateTo(`../${pageKey}/index`)
  },
  getCategory: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getCategory('guess_write')
      this.setData({
        category:res.feature.categories
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})