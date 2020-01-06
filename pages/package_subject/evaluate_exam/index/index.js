"use strict"
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from "../../../../utils/common_import"
import gqlSubject from '../../../../network/graphql/subject'
Page({
  data: {
    subjects: [],
    printPaperCount: 0,
    percentage: 0,
    loadReady: true
  },
  onLoad() {
    this.weToast = new app.weToast()
    this.getSubjects()
  },
  getSubjects: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gqlSubject.getSubjects()
      if (!res.xuekewang.registered) {
        this.registerSubject()
        return
      }
      this.setData({
        subjects: res.xuekewang.subjects,
        percentage: res.xuekewang.percentage,
        printPaperCount: res.xuekewang.printPaperCount,
        loadReady: true
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  registerSubject: co.wrap(function* () {
    try {
      let res = yield gqlSubject.register()
      if (res.Register.state) {
        this.getSubjects()
      } else {
        throw (res)
      }
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  toSubject(e) {
    if (app.preventMoreTap(e)) return
    wxNav.navigateTo('../testpaper/index', {
      id: e.currentTarget.dataset.id
    })
  }
})