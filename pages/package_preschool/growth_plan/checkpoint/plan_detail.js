// pages/package_preschool/growth_plan/checkpoint/plan_detail.js
const app = getApp()
import {regeneratorRuntime, co, wxNav, util, logger} from '../../../../utils/common_import'
// import { threadId } from 'worker_threads';
// import api from '../../../network/restful_request'
const showModal = util.promisify(wx.showModal)

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.longToast = new app.weToast

  },

  /**
   * 开始打印
   */
  beginPrint: co.wrap(function* () {
    wxNav.navigateTo('/pages/package_preschool/growth_plan/print_setting/print_setting')
  }),
})