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

  },
  onLoad: function (options) {
    this.longToast = new app.weToast()
  },
  onShow: function () {

  },
  changeAvatar: function () {
    this.selectComponent("#checkComponent").showPop()
  },
  changeName: function () {
    router.navigateTo('/pages/package_common/account/name_edit')
  },
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
})