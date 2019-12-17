"use strict"

const app = getApp()
import { regeneratorRuntime, co, util } from '../../../utils/common_import'
const event = require('../../../lib/event/event')
const showModal = util.promisify(wx.showModal)
import graphql from '../../../network/graphql_request'
import storage from '../../../utils/storage'
import router from '../../../utils/nav.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_course/course/course')
Page({
  data: {
    title: '',
    course: null,
    interval: 5000,
    activeTab: 0,
    hiddenShareTip: true,
    unfoldChapter: false,
    viewHeight: 0,
    scrollTop: 0,
    isFixedNav: false,
    isCollected: false,
    canShare: false,
    supplyTypes: [],
    loadReady: false,
    showCodeCourseModal: false,
    checkboxFlag: false,
    navBarTop: 0,
  },

  onLoad: co.wrap(function*(query) {
   try {
    this.shareSn = ''
    this.unionId = storage.get('unionId')
    this.longToast = new app.weToast()
      // 继续学习
    this.isContinue = query.isContinue ? Number(query.isContinue) : 0
      // 助力成功
    this.isShareSuccess = query.isShareSuccess ? Boolean(query.isShareSuccess) : false
    this.sn = query.sn
    let systemInfo = wx.getSystemInfoSync()
    console.log(systemInfo.windowHeight - 50,'==systemInfo.windowHeight - 50=')
    let screenWidth = systemInfo.screenWidth
    this.swiperHeight = screenWidth * 8 / 15
    let isAndroid = systemInfo.system.toLocaleLowerCase().indexOf('android') > -1
    let hiddenShareTip = storage.get('hiddenShareTip')
    this.setData({
      viewHeight: systemInfo.windowHeight - 50,
      navBarTop: app.navBarInfo && app.navBarInfo.topBarHeight,
      hiddenShareTip: !!hiddenShareTip,
      unionId: this.unionId,
      isAndroid: isAndroid
    })
    // 分享
    event.on('Authorize', this, () => {
      this.unionId = storage.get('unionId')
    })
   } catch(err) {
     logger.info(err)
   }
  }),

  onShow: co.wrap(function*() {
    this.getCourseDetail()
  }),

  // 课程分享，用户打开无unionId，跳转授权
  authCheck: co.wrap(function*() {
    if (!this.unionId) {
      router.navigateTo('/pages/authorize/index')
      return false
    } else {
      return true
    }
  }),

  displayTab(isPayed) {
    if (this.isContinue || this.isShareSuccess || isPayed) {
      this.setData({
        activeTab: 1
      })
    }
  },

  showCodeCourseModal(code) {
    let hideCode2CourseModal = Boolean(storage.get('hideCode2CourseModal'))
    if (!hideCode2CourseModal && code) {
      this.setData({
        showCodeCourseModal: true
      })
    }
  },

  closeCodeCourseModal() {
    this.setData({
      showCodeCourseModal: false
    })
    if (this.data.checkboxFlag) {
      storage.get('hideCode2CourseModal', true)
    }
  },

  copyCode() {
    wx.setClipboardData({
      data: this.data.course.code
    })
  },

  checkboxChange() {
    let checkboxFlag = this.data.checkboxFlag
    this.setData({
      checkboxFlag: !checkboxFlag
    })
  },

  pageScroll(e) {
    let scrollTop = e.detail.scrollTop
    let isFixedNav = scrollTop > this.swiperHeight ? true : false
    this.setData({
      isFixedNav
    })
  },

  toExclusive: co.wrap(function*({currentTarget: {dataset: index}}) {
    logger.info('点击了耗材推荐')
    let supplies = this.data.supplyTypes,
        appId = supplies[index].appId,
        path = supplies[index].url;
    wx.navigateToMiniProgram({
      appId: appId,
      path: path,
      success: (res)=>{
        logger.info('navigateToMiniProgram', res)
      }
    })
  }),

  chapterClick(e) {
    console.log(e)
    let isLock = Boolean(Number(e.currentTarget.dataset.lock)),
      shareable = Boolean(e.currentTarget.dataset.shareable),
      sn = e.currentTarget.dataset.sn
    if (isLock) {
      let tipText = ''
      if (shareable) {
        tipText = `邀请${this.data.course.promotion_num}人助力`
      } else {
        tipText = this.data.isAndroid ? '购买课程' : '加入学习'
      }
      wx.showToast({
        title: `${tipText}可解锁`,
        icon: 'none'
      })
    } else {
      router.navigateTo('/pages/package_course/print/print', {
        sn: sn
      })
    }
  },

  unfoldChapter: co.wrap(function*(e) {
    let index = Number(e.currentTarget.id),
      preFoldStatus = this.data.course.courseChapters[index].unfoldChapter,
      unfoldTarget = "course.courseChapters[" + index + "].unfoldChapter"
    this.setData({
      [unfoldTarget]: !preFoldStatus
    })
  }),

  unfoldChapterAll: co.wrap(function*({currentTarget: {dataset: {index}}}) {
     var unfoldAllTarget = "course.courseChapters[" + Number(index) + "].unfoldChapterAll"
    this.setData({
      [unfoldAllTarget]: true
    })
  }),

  // 跳转购买
  toBuy: co.wrap(function*() {
    let isAuth = yield this.authCheck()
    if (isAuth) {
      let isAndroid = this.data.isAndroid
      if (isAndroid) {
        router.navigateTo('/pages/package_course/pay_order/pay_order', {
          sn: this.sn
        })
      } else {
        var resp = yield graphql.getPaymentCheck({
          sn: this.sn,
          type: "course"
        })
        var isFree = resp.paymentCheck && resp.paymentCheck.isFree
        if (!isFree) {
          yield showModal({
            title: '重要提示',
            content: '根据相关规定，iOS手机暂不可学习该课程，请使用安卓手机学习，另外您可试学本课程。',
            showCancel: false,
            confirmColor: '#FFDC5E',
            confirmText: '确定'
          })
          this.navTap()
        } else {
          yield this.addMyCourses()
        }
      }
    }

  }),

  // ios，0元加入学习
  addMyCourses: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading',
      title: '请稍等'
    })
    try {
      let params = {
        sn: this.sn,
        type: 'course',
      }
      let resp = yield graphql.createResource(params)
      this.longToast.hide()
      wx.showToast({
        title: `加入学习成功`,
        icon: 'none'
      })
      yield this.getCourseDetail()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  }),
  
  navTap: co.wrap(function*(e) {
    let isAuth = yield this.authCheck(),
      index = e ? e.currentTarget.id : 1
    if (isAuth) {
      this.setData({
        activeTab: index,
        scrollTop: 0
      })
    }
  }),

  closeShareTip() {
    this.setData({
      hiddenShareTip: true
    })
    storage.put('hiddenShareTip', true)
  },

  onShareAppMessage(res) {
    if (res.from === 'button') {
      if (this.data.canShare) {
        graphql.shareAssistance(this.sn)
        return {
          title: '你好，我想学这个，帮帮我！',
          path: `/pages/package_course/share_course/share_course?sn=${this.shareSn}`
        }
      } else if (this.unionId) {
        return {
          title: '这个课程好棒啊 快来看看吧',
          path: `/pages/package_course/course/course?sn=${this.sn}`
        }
      } else {
        return app.share
      }
    } else {
      return app.share
    }
  },

  collectCourse: co.wrap(function*() {
    let isAuth = yield this.authCheck()
    if (isAuth) {
      this.longToast.toast({
        type: 'loading',
        title: '请稍等'
      })
      try {
        var isCollected = this.data.isCollected
        yield graphql.collectCourse({
            type: 'course',
            sn: this.sn,
            action: isCollected ? 'destroy' : 'create'
          })
        
        this.longToast.hide()
        let tipText = isCollected ? '取消收藏成功' : '收藏成功'
        wx.showToast({
          icon: 'none',
          title: tipText
        })
        this.setData({
          isCollected: !isCollected
        })

      } catch (error) {
        this.longToast.hide()
        util.showError(error)
      }
    }

  }),

  // 获取课程详情
  getCourseDetail: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      let resp = yield graphql.getCourseDetail(this.sn)
   
      let course = resp.course,
        lastStudySn = course.lastCourseChapterSn

      course.introduction = course.introduction.replace(/alt=""/g, `style="max-width:100%;vertical-align:middle;"`)
      for (let i = 0; i < course.courseChapters.length; i++) {
        let unfoldChapter = false
        if (course.courseChapters[i].sn == lastStudySn) {
          unfoldChapter = true
        }
        course.courseChapters[i].unfoldChapter = unfoldChapter
        course.courseChapters[i].unfoldChapterAll = false
      }

      this.setData({
        title: course.name,
        course: course,
        isCollected: course.courseCollected,
        canShare: course.userCanShareToTrial,
        supplyTypes: [...resp.consumables],
        loadReady: true
      })
      this.shareSn = course.shareSn
      this.showCodeCourseModal(course.code)
      this.displayTab(course.payed) // 切换tab
      this.longToast.hide()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  }),

  onUnload() {
    event.remove('Authorize', this)
  }
})