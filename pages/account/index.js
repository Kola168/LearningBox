/*
 * @Author: your name
 * @Date: 2019-12-12 19:34:39
 * @LastEditTime: 2019-12-16 11:11:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/pages/account/index.js
 */
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
	},
	
	net1:function(){
		console.log('11111')
		router.navigateTo('/pages/package_device/network/index/index')
	}
})