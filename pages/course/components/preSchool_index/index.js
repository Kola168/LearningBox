// pages/course/components/components/preSchool_index/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
const event = require('../../../../lib/event/event')
import graphql from '../../../../network/graphql_request'
import storage from '../../../../utils/storage'
import router from '../../../../utils/nav.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

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
    __wetoast__: null
  },

  lifetimes: {
    attached: co.wrap(function *(){
      var _this = this
      this.activeDevice = app.activeDevice
      let userSn = storage.get('userSn')
      this.userSn = userSn
      this.longToast = new app.weToast()
      yield this.getCourseIndex()
      let isAndroid = app.sysInfo.system.toLocaleLowerCase().indexOf('android') > -1
      this.setData({
        isAndroid: isAndroid,
        userSn: userSn
      })

      event.on('Authorize', this, () => {
        this.userSn = storage.get('userSn')
        this.getCourseIndex()
      })

      event.on('LearnRefresh', this, co.wrap(function*() {
        yield _this.getCourseIndex()
        _this.userSn && _this.getLastCourseInfo()
        wx.stopPullDownRefresh()
      }))
    }),

    detached: function() {
      event.remove('LearnRefresh', this)
      event.remove('Authorize', this)
    },
  },

  pageLifetimes: {
    show: co.wrap(function*(){
      let userSn = storage.get('userSn')
      this.userSn = userSn
      if (userSn) {
        this.getLastCourseInfo()
        this.setData({
          userSn
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
    }),
    hide: function(){
      event.remove('LearnRefresh', this)
      event.remove('Authorize', this)
    }
  },

  methods: {
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
      if (!this.userSn) {
        router.navigateTo('/pages/authorize/index')
        return false
      } else {
        return true
      }
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
        util.showError(error)
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
