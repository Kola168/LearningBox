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
  onLoad() {
    this.weToast = new app.weToast()
    this.getSubjectsErrorbook()
  },
  getSubjectsErrorbook: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getSubjectsErrorbook()
      console.log(res)
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