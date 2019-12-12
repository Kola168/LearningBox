import {
  regeneratorRuntime,
  co,
  util
} from '../../../utils/common_import'
const app = getApp()
import graphql from '../../../network/graphql_request'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_course/issue_center/issue_center')

Page({

  data: {
    is_empty: false, // 课程是否为空
    courseList: [], // 课程列表
    is_android: false, //是否是安卓平台
    isMember: false,
    mainImageUrl: ''
  },

  onLoad: function (options) {
    var _this = this
    var sn = options.sn
    var systemInfo = wx.getSystemInfoSync()
    _this.longToast = new app.weToast()
    try {
      _this.setData({
        is_android: systemInfo.system.indexOf('iOS') > -1 ? false : true,
      })
      _this.getCategory(sn)
    } catch (err) {
      logger.info(err)
    }
  },

  // 获取专题详情
  getCategory: co.wrap(function* (sn) {
    try {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后'
      })
      var resp = yield graphql.getSubjectContent(sn)
   
      this.setData({
        courseList: (resp.category.courses) || [],
        mainImageUrl: resp.category.image,
        is_empty: (resp.category.courses && resp.category.courses.length > 0) ? false : true
      })
    } catch (err) {
      util.showError(err)
    } finally {
      this.longToast.hide()
      wx.stopPullDownRefresh()
    }
  }),

  // 课程详情
  enterDetail: function ({
    currentTarget: {
      dataset: {
        sn
      }
    }
  }) {
    router.navigateTo('/pages/package_course/course/course', {
      isContinue: 0,
      sn: sn
    })
  },

  // 图片预览
  previewImg: function () {
    wx.previewImage({
      current: this.data.mainImageUrl,
      urls: [this.data.mainImageUrl]
    })
  }
})