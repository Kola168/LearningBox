// pages/course/components/components/preSchool_index/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../../../utils/common_import'
const event = require('../../../../lib/event/event')
import graphql from '../../../../network/graphql_request'
Component({
  data: {
    activeIndex: 0,
    autoplay: true,
    interval: 3000,
    userLastCourse: null,
    banners: [],
    recommendCourse: [],
    selectCategories: [],
    isAndroid: false,
    isMember: false,
    __wetoast__: null,
    auth: false,
    currentWidth: 0,
  },

  lifetimes: {
    attached: co.wrap(function *(){
      var _this = this
      this.activeDevice = app.activeDevice
      this.longToast = new app.weToast()
      yield this.getCourseIndex()
      let isAndroid = app.sysInfo.system.toLocaleLowerCase().indexOf('android') > -1
      this.setData({
        isAndroid: isAndroid,
        auth: app.isScope()
      })

      event.on('Authorize', this, () => {
        this.setData({
          auth: app.isScope()
        })
        this.getCourseIndex()
      })

      event.on('LearnRefresh', this, co.wrap(function*() {
        yield _this.getCourseIndex()
        app.isScope() && _this.getLastCourseInfo()
        wx.stopPullDownRefresh()
      }))
      this.init()
    }),

    detached: function() {
      event.remove('LearnRefresh', this)
      event.remove('Authorize', this)
    },
  },

  pageLifetimes: {
    show: co.wrap(function*(){
      this.init()
    }),
    hide: function(){
      event.remove('LearnRefresh', this)
      event.remove('Authorize', this)
    }
  },

  methods: {
    init: co.wrap(function *() {
      if (app.isScope()) {
        yield this.getLastCourseInfo()
        this.setData({
          auth: true
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
              yield this.getCourseIndex()
              this.activeDevice = app.activeDevice
            }
          } else {
            yield this.getCourseIndex()
            this.activeDevice = app.activeDevice
          }
        }
        this.initProgress()
      }
    }),

    initProgress: function() {
      var sysInfo = wx.getSystemInfoSync()
      var totalWidth = sysInfo.screenWidth * 0.78
      var scale = this.data.userLastCourse.finished / this.data.userLastCourse.total
      var currentWidth = totalWidth * scale
      this.setData({
        currentWidth,
        totalWidth
      })
    },

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
        wxNav.navigateTo('/pages/package_course/course/course', {
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
          wxNav.navigateTo(redirectUrl)
        }
      }
  
    }),
  
    toMyCourse: co.wrap(function* () {
      let isAuth = yield this.authCheck()
      if (isAuth) {
        wxNav.navigateTo('/pages/package_course/mine_course_list/mine_course_list')
      }
  
    }),
  
    toSelectProjectList: co.wrap(function* () {
      let isAuth = yield this.authCheck()
      if (isAuth) {
        wxNav.navigateTo('/pages/package_course/issue_list/issue_list')
      }
    }),
  
    toSelectProject: co.wrap(function* (e) {
      let isAuth = yield this.authCheck()
      if (isAuth) {
        let id = e.currentTarget.id
        wxNav.navigateTo('/pages/package_course/issue_center/issue_center', {
          sn: id
        })
      }
    }),
  
    toCourseCenter: co.wrap(function* () {
      let isAuth = yield this.authCheck() 
      let isMember = this.data.isMember ? 1 : 0
      if (isAuth) {
        wxNav.navigateTo('/pages/package_course/course_center/course_center', {
          isMember: isMember
        })
      }
    }),
  
    authCheck: co.wrap(function* () {
      if (!app.isScope()) {
        wxNav.navigateTo('/pages/authorize/index')
        return false
      } else {
        return true
      }
    }),

    joinCourse: co.wrap(function*(){
      wxNav.navigateTo('/pages/package_course/course_center/course_center')
    }),
  
    // 获取推荐 || banner
    getCourseIndex: co.wrap(function* () {
      this.longToast.toast({
        type: 'loading',
        title: '请稍候'
      })
      try {
        var respRecommend = yield graphql.getCourses('recommendation')
        var banners = yield graphql.getCourseBanner('course')
        var selectCategories = yield graphql.getCourseSubject('course')
        this.setData({
          recommendCourse: respRecommend.courses,
          banners: banners.banners,
          selectCategories: selectCategories.feature && selectCategories.feature.categories
        })
        this.longToast.hide()
      } catch (error) {
        this.longToast.hide()
        // util.showError(error)
      }
    }),
    
    // 获取最后一次学习的信息
    getLastCourseInfo: co.wrap(function* () {
      try {
        let res = yield graphql.getLastCourseInfo()
        this.setData({
          userLastCourse: res.currentUser.lastCourse
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
  }
})
