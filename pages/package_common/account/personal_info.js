// pages/package_common/account/personal_info.js
const app = getApp()
import gql from '../../../network/graphql_request.js'
import api from '../../../network/restful_request.js'
import router from '../../../utils/nav'
const getImageInfo = util.promisify(wx.getImageInfo)
import {
  co,
  util
} from '../../../utils/common_import.js'
import regeneratorRuntime from '../../../lib/co/runtime'
Page({
  data: {
    birthday: '未填写',
    kidInfo: null
  },
  onLoad: function (options) {
    this.longToast = new app.weToast()

  },
  onShow: function () {
    this.getUserInfo()
  },
  getUserInfo: co.wrap(function* () {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      let resp = yield gql.getUser()
      this.setData({
        kidInfo: resp.currentUser.selectedKid,
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),
  changeAvatar: function () {
    this.selectComponent("#checkComponent").showPop()
  },
  changeName: function () {
    router.navigateTo('/pages/package_common/account/name_edit')
  },
  bindbirthChange: co.wrap(function* (e) {
    this.setData({
      birthday: e.detail.value
    })
  }),
  uploadImage: co.wrap(function* (e) {
    if (!e.detail.tempFilePaths[0]) {
      return util.showError({
        title: '照片加载失败',
        content: '请重新选择重试'
      })
    }
    this.path = e.detail.tempFilePaths[0]
    router.navigateTo('/pages/package_common/account/avatar_edit', {
      url: this.path
    })
  }),
  changeGedner: co.wrap(function* (e) {
    let gender = e.currentTarget.id
    console.log(e, e.currentTarget.id)
    if (gender == this.data.kidInfo.gender) {
      return
    }
    yield this.complete({
      kidAttributes: {
        gender: gender,
      }
    })
  }),
  complete: co.wrap(function* (params) {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      const resp = yield gql.changeStage(params)
      console.log(resp)
      // throw(resp)
      this.setData({
        kidInfo: resp.updateKid.kid
      })
      this.longToast.hide()
    } catch (e) {
      util.showError(e)
      this.longToast.hide()
    }
  }),
  changeStage(){
    router.navigateTo('pages/index/grade')
  }
})