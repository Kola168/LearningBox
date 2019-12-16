// pages/account/index.js
const app = getApp()
import gql from '../../network/graphql_request.js'
import api from '../../network/restful_request.js'
import router from '../../utils/nav'
import {
  co,
  util
} from '../../utils/common_import.js'
import regeneratorRuntime from '../../lib/co/runtime'

const getUserInfo = util.promisify(wx.getUserInfo)

Page({
  data: {
    kidInfo:null
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
  toSetInfo:function(){
    router.navigateTo('/pages/package_common/account/personal_info')
  }
})