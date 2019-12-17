// pages/index/grade.js
const app = getApp()
import gql from '../../network/graphql_request.js'
import wxNav from '../../utils/nav.js'
import api from '../../network/restful_request.js'
import router from '../../utils/nav'
import {
  co,
  util
} from '../../utils/common_import.js'
import regeneratorRuntime from '../../lib/co/runtime'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeGrade: '',
    stages: []
  },
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    yield this.getAllstages()
    if (options.grade) {
      this.setData({
        activeGrade: options.grade
      })
      this.sn = options.sn
    } else {
      this.sn = this.data.stages[0].children[0].children[0].sn
      this.setData({
        activeGrade: this.data.stages[0].children[0].children[0].name
      })
    }

  }),
  getAllstages: co.wrap(function* () {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      let resp = yield gql.getAllstages()
      this.setData({
        stages: resp.stages
      })
      console.log(resp, this.data.stages)
      this.longToast.hide()
    } catch (e) {
      util.showError(e)
      this.longToast.hide()
    }
  }),
  chooseGrade: co.wrap(function* (e) {
    console.log(e)
    this.setData({
      activeGrade: e.currentTarget.id,
    })
    this.sn = e.target.dataset.sn
  }),
  complete: co.wrap(function* () {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    let params = {
      kidAttributes: {
        stageSn: this.sn
      }
    }
    console.log(params)
    // return
    try {
      const resp = yield gql.changeStage(params)
      this.longToast.hide()
      router.navigateBack()
    } catch (e) {
      util.showError(e)
      this.longToast.hide()
    }
  })
})