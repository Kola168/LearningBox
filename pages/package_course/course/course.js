"use strict"

const app = getApp()
import { regeneratorRuntime, co, util } from '../../../utils/common_import'
const event = require('../../../lib/event/event')
const getSystemInfo = util.promisify(wx.getSystemInfo)
const showModal = util.promisify(wx.showModal)
import graphql from '../../../network/graphql_request'
import wxPay from '../../../utils/wxPay'
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
    hasCountLimit: false,
    supplyTypes: [],
    loadReady: false,
    appId: 'wxde848be28728999c',
    shopId: 24056376,
    showCodeCourseModal: false,
    checkboxFlag: false,
    navBarTop: 0,
  },

  onLoad: co.wrap(function*(query) {
    this.shareSn = ''
    this.unionId = storage.get('unionId')
    this.longToast = new app.weToast()
      // 继续学习
    this.isContinue = query.isContinue ? Number(query.isContinue) : 0
      // 助力成功
    this.isShareSuccess = query.isShareSuccess ? Boolean(query.isShareSuccess) : false
    this.sn = query.sn
    let systemInfo = yield getSystemInfo()
    let screenWidth = systemInfo.screenWidth
    this.swiperHeight = screenWidth * 8 / 15
    let isAndroid = systemInfo.system.toLocaleLowerCase().indexOf('android') > -1
    let hiddenShareTip = storage.get('hiddenShareTip')
    this.setData({
      navBarTop: app.navBarInfo.navBarHeight,
      hiddenShareTip: hiddenShareTip ? true : false,
      viewHeight: systemInfo.windowHeight - 50,
      unionId: this.unionId,
      isAndroid: isAndroid
    })
    // 分享
    event.on('Authorize', this, () => {
      this.unionId = storage.get('unionId')
    })
  }),

  onShow: co.wrap(function*() {
    this.getCourseDetail()
  }),

  // 课程分享，用户打开无unionId，跳转授权
  authCheck: co.wrap(function*() {
    // if (!this.unionId) {
    //   router.navigateTo('/pages/authorize/index')
    //   return false
    // } else {
    //   return true
    // }
    return true
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
      isFixedNav: isFixedNav
    })
  },

  toExclusive: co.wrap(function*(e) {
    logger.info('点击了耗材推荐')
    // let index = e.currentTarget.id,
    //   supplies = this.data.supplyTypes,
    //   alias = supplies[index].alias
    
    // router.navigateTo('/pages/cart/transit/transit', {
    //   pageType: 'goodsDetail',
    //   goodsId: alias,
    //   openId: app.openId,
    //   shopId: this.data.shopId,
    //   appId: this.data.appId
    // })
  
  }),

  chapterClick(e) {
    let isLock = Boolean(Number(e.currentTarget.dataset.lock)),
      shareable = Boolean(e.currentTarget.dataset.shareable),
      sn = e.currentTarget.id
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

  unfoldChapterAll: co.wrap(function*(e) {
    let index = Number(e.currentTarget.dataset.index),
      unfoldAllTarget = "course.courseChapters[" + index + "].unfoldChapterAll"
    this.setData({
      [unfoldAllTarget]: true
    })
  }),

  toBuy: co.wrap(function*() {
    let isAuth = yield this.authCheck()
    if (isAuth) {
      let payPrice = Number(this.data.course.display_price),
        isAndroid = this.data.isAndroid
      if (isAndroid) {
        router.navigateTo('/pages/package_course/pay_order/pay_order', {
          sn: this.sn
        })
      } else {
        if (payPrice > 0) {
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
        resourceInfo: {
          resourceSign: this.sn,
          title: this.data.course.name,
        },
        type: 'course',
      }
      let resp = yield graphql.createOrder(params)
      yield wxPay.invokeWxPay({
        paymentSn: resp.createPayment.payment.sn
      })
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
      if (this.data.canShare ) {
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
      course.display_price = (course.priceYuan / 100).toFixed(2)

      this.setData({
        course: course,
        isCollected: course.courseCollected,
        canShare: course.userCanShareToTrial,
        supplyTypes: [...resp.consumables, ...resp.consumables],
        loadReady: true
      })
      this.setData({
        title: course.name
      })
      this.shareSn = course.shareSn
      this.showCodeCourseModal(course.code)
      this.displayTab(course.payed) // 切换tab
      this.longToast.toast()
    } catch (error) {
      
      this.longToast.toast()
      util.showError(error)
    }
  }),

  onUnload() {
    event.remove('Authorize', this)
  }
})