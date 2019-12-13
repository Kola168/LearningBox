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
    discipline: [
      ['0~3岁', '小班', '中、大班'],
      ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
      ['七年级', '八年级', '九年级'],
      ['高一', '高二', '高三']
    ],
    activeGrade: '0~3岁',
    stages: []
  },
  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.getAllstages()

  },
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
      console.log(resp)
      this.longToast.hide()
      router.navigateBack()
    } catch (e) {
      util.showError(e)
      this.longToast.hide()
    }

  })
})