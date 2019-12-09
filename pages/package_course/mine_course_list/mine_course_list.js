import {
  regeneratorRuntime,
  co,
  util
} from '../../../utils/common_import'
const app = getApp()
const request = util.promisify(wx.request)
import Logger from '../../../utils/logger'
const logger = new Logger.getLogger('pages/package_course/mine_course_list/mine_course_list')
Page({
  data: {
    is_android: false, //是否是安卓平台
    active_index: 0,
    tabList: [{
        title: '我的课程',
        selected: true
      },
      {
        title: '我的收藏',
        selected: false
      }
    ],
    courseList: [],
    favorList: [],
    index: 0 // update index
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.verifyPlat()
  },

  onShow: function () {
    this.refreshData()
  },

  verifyPlat: function () {
    try {
      var _this = this
      var systemInfo = wx.getSystemInfoSync()
      _this.setData({
        is_android: systemInfo.system.indexOf('iOS') > -1 ? false : true
      })

    } catch (err) {
      logger.info(err)
    }
  },

  switchTab({
    currentTarget: {
      dataset: {
        index
      }
    }
  }) {
    this.data.index = index
    this.refreshData()
  },

  refreshData: function () {
    var index = this.data.index
    var reStack = [{
      key: 'courseList',
      title: '我的课程',
      fn: this.getCourseList
    }, {
      key: 'favorList',
      title: '我的收藏',
      fn: this.getFavorList
    }]
    var current = reStack[index]
    this.setData({
      is_empty: false,
      active_index: index,
      [`${current.key}`]: []
    })
    this.setData({
      title: current.title
    })
    current.fn()
  },

  // 获取收藏
  getFavorList: co.wrap(function* () {
    try {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后'
      })
      var resp = yield request({
        url: app.apiServer + `/boxapi/v2/collections/${app.openId}`,
        method: 'GET',
        dataType: 'json',
        data: {
          type: 'course'
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      var res = resp.data.res
      this.setData({
        favorList: res || [],
        is_empty: res && res.length > 0 ? false : true
      })
    } catch (err) {
      logger.info(err)

    } finally {
      this.longToast.hide()
    }
  }),

  // 获取课程
  getCourseList: co.wrap(function* () {
    try {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后'
      })
      var resp = yield request({
        url: app.apiServer + `/boxapi/v2/course_base/user/${app.openId}/courses`,
        method: 'GET',
        dataType: 'json'
      })
      var res = resp.data.res
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      this.setData({
        courseList: res.courses || [],
        is_empty: res && res.courses.length > 0 ? false : true
      })

    } catch (err) {
      logger.info(err)

    } finally {
      this.longToast.hide()
    }
  }),

  // 跳转课程详情
  enterDetail: function ({
    currentTarget: {
      dataset: {
        sn
      }
    }
  }) {
    router.navigateTo('/pages/package_course/course/course', {
      sn: sn
    })
  },

  copyActiveCode: function (e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.code,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  }
})