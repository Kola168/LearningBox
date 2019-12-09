import {
  regeneratorRuntime,
  co,
  util
} from '../../../utils/common_import'
const app = getApp()
const request = util.promisify(wx.request)
import graphql from '../../../network/graphql_request'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger'
const logger = new Logger.getLogger('pages/package_course/course_center/course_center')
Page({
  data: {
    is_empty: false, // 课程是否为空
    courseList: [], // 课程列表
    is_android: false, //是否是安卓平台
    isMember: false
  },

  onLoad: function (options) {
    var _this = this
    _this.longToast = new app.weToast()
    var systemInfo = wx.getSystemInfoSync()
    var isMember = Boolean(Number(options.isMember))
    try {
      _this.setData({
        is_android: systemInfo.system.indexOf('iOS') > -1 ? false : true,
        isMember
      })
      _this.getCourseList()
    } catch (err) {
      logger.info(err)
    }
  },

  // 获取课程列表
  getCourseList: co.wrap(function* () {
    try {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后'
      })
      let res = yield graphql.getCourseIndex('list')
      this.setData({
        courseList: res && res.courses || [],
        is_empty: res && res.courses.length > 0 ? false : true
      })
    } catch (err) {
      this.setData({
        is_empty: true
      })
    } finally {
      wx.stopPullDownRefresh()
      this.longToast.hide()
    }
  }),

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

  onPullDownRefresh: function () {
    this.getCourseList()
  }
})