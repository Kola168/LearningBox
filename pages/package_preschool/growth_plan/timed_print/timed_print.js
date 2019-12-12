// pages/package_preschool/timed_print/timed_print.js
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
     * 定时打印设置后的确认
     */
    confirmTimedSetting: co.wrap(function* (){
      // this.weToast.toast('订阅成功')
      wxNav.navigateTo('/pages/package_preschool/growth_plan/checkpoint/plan_checkpoint')
    })
  })