"use strict"
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../utils/common_import'
const event = require('../../lib/event/event')
import api from '../../network/restful_request'
import graphql from '../../network/graphql_request'
import storage from '../../utils/storage'
import router from '../../utils/nav.js'

Page({
  data: {
    activeIndex: 0,
    autoplay: true,
    interval: 3000,
    userLastCourse: null,
    banners: [
      {url: 'https://cdn-h.gongfudou.com/epbox/picture/category_e42cf96c50534c57a8f9d102e86d237a.jpg'},
      {url: 'https://cdn-h.gongfudou.com/epbox/picture/category_e42cf96c50534c57a8f9d102e86d237a.jpg'}
    ],
    recommendCourse: [
      {
        desc: '著名作家小星星倾情力作',
        studyUsers: 20,
        totalLessons: 120,
        recommendationImageUrl: 'https://cdn-h.gongfudou.com/epbox/picture/category_e42cf96c50534c57a8f9d102e86d237a.jpg'
      }
    ],
    selectCategories: [],
    isAndroid: false,
    isMember: false
  },

  onLoad: co.wrap(function* () {
    this.activeDevice = app.activeDevice
    let unionId = storage.get('unionId')
    this.unionId = unionId
    this.longToast = new app.weToast()
    yield this.getCourseIndex()
    let isAndroid = app.sysInfo.system.toLocaleLowerCase().indexOf('android') > -1
    this.setData({
      isAndroid: isAndroid,
      unionId: unionId
    })

    let hideCourseRedDot = storage.get('hideCourseRedDot')
    if (!hideCourseRedDot) {
      wx.hideTabBarRedDot({
        index: 1
      })
      storage.put('hideCourseRedDot', true)
    }
    event.on('Authorize', this, () => {
      this.unionId = storage.get('unionId')
      // this.isMember()
      this.getCourseIndex()
    })

    // try {
    // 	app.gio('track', 'course', {})
    // } catch (e) {}
  }),

  onShow() {
    let unionId = storage.get('unionId')
    this.unionId = unionId
    if (unionId) {
      this.getLastCourseInfo()
      this.setData({
        unionId
      })
      if (app.activeDevice) {
        let isMember = app.activeDevice.is_member
        this.setData({
          isMember
        })
        if (this.activeDevice) {
          let lastActiveDeviceId = this.activeDevice.device_id,
            currentActiveDeviceId = app.activeDevice.device_id
          if (lastActiveDeviceId != currentActiveDeviceId) {
            this.getCourseIndex()
            this.activeDevice = app.activeDevice
          }
        } else {
          this.getCourseIndex()
          this.activeDevice = app.activeDevice
        }
      }
    }
  },

  isMember: co.wrap(function* () {
    let res = yield graphql.isMember(),
      isMember = res.user.isMember
    this.setData({
      isMember
    })
  }),

  formatCount(count) {
    if (count < 10000) {
      return count
    } else {
      return Math.floor(count / 10000) + 'w+'
    }
  },

  toCourseDetail: co.wrap(function* (e) {
    let isAuth = yield this.authCheck()
    if (isAuth) {
      let id = e.currentTarget.id,
        index = 0
      if (e.currentTarget.dataset.index) {
        index = e.currentTarget.dataset.index
      }
      router.navigateTo('/pages/package_course/course/course', {
        sn: id,
        isContinue: index
      })
     
    }

  }),

  swiperClick: co.wrap(function* (e) {
    let isAuth = yield this.authCheck()
    if (isAuth) {
      let index = e.currentTarget.id,
        redirectUrl = this.data.banners[index].redirectUrl
      if (redirectUrl) {
        router.navigateTo(redirectUrl)
      }
    }

  }),

  toMyCourse: co.wrap(function* () {
    let isAuth = yield this.authCheck()
    if (isAuth) {
      router.navigateTo('/pages/package_course/mine_course_list/mine_course_list')
    }

  }),

  toSelectProjectList: co.wrap(function* () {
    let isAuth = yield this.authCheck()
    if (isAuth) {
      router.navigateTo('/pages/package_course/issue_list/issue_list')
    }
  }),

  toSelectProject: co.wrap(function* (e) {
    let isAuth = yield this.authCheck()
    if (isAuth) {
      let id = e.currentTarget.id
      router.navigateTo('/pages/package_course/issue_center/issue_center', {
        sn: id
      })
    }
  }),

  toCourseCenter: co.wrap(function* () {
    let isAuth = yield this.authCheck()
    let isMember = this.data.isMember ? 1 : 0
    if (isAuth) {
      router.navigateTo('/pages/package_course/course_center/course_center', {
        isMember: isMember
      })
    }
  }),

  authCheck: co.wrap(function* () {
    if (!this.unionId) {
      router.navigateTo('/pages/authorize/authorize')
      return false
    } else {
      return true
    }
  }),

  getCourseIndex: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      // let params = {}
      // if (this.unionId) {
      //   params.openid = app.openId
      // }
      let respRecommend = yield graphql.getCourseIndex('recommendation')
      let respCategories = yield graphql.getSeletedCategories('course')
      this.setData({
        banners: respRecommend.banners,
        recommendCourse: respRecommend.courses,
        selectCategories: respCategories.categories
      })
      this.longToast.hide()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  }),

  getLastCourseInfo: co.wrap(function* () {
    try {
      let resp = yield api.getLastCourseInfo(app.openId)
      if (resp.code !== 0) {
        throw (resp)
      }
      this.setData({
        userLastCourse: resp.res.user_last_course
      })
    } catch (error) {
      util.showError(error)
    }
  }),

  changeDots: function ({detail: {current}}) {
    this.setData({
      activeIndex: current
    })
  },

  onPullDownRefresh: co.wrap(function* () {
    yield this.getCourseIndex()
    this.unionId && this.getLastCourseInfo()
    wx.stopPullDownRefresh()
  }),

  onUnload() {
    event.remove('Authorize', this)
  }
})