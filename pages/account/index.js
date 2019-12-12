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

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.checkUserInfo()
  },

  checkUserInfo: co.wrap(function* () {
    let userInfo
    try {
      userInfo = yield getUserInfo()
    } catch (e) {
      console.log(e)
    }
    if (userInfo.userInfo) {
      this.setData({
        userInfo: userInfo.userInfo
      })
    }
  }),
  toSetInfo:function(){
    router.navigateTo('/pages/package_common/account/personal_info')
  }
})