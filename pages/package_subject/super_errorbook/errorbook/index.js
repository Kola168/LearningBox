const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from "../../../../utils/common_import";

import graphql from '../../../../network/graphql/subject'

Page({
  data: {
    subjects: []
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.getSubjectsErrorbook()
  },
  toErrorbookList(e) {
    let sn = e.currentTarget.id
    wxNav.navigateTo('../errorbook/list', {
      sn
    })
  },
  getSubjectsErrorbook: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getSubjectsErrorbook()
      this.setData({
        subjects: res.xuekewang.subjects
      })
      this.weToast.hide()
    } catch (error) {
      util.showError(error)
      this.weToast.hide()
    }
  })
})