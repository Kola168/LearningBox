"use strict"

const app = getApp()
import { regeneratorRuntime, co, util } from '../../../utils/common_import'
import api from '../../../network/restful_request'
const event = require('../../../lib/event/event')
const getSystemInfo = util.promisify(wx.getSystemInfo)
const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
import graphql from '../../../network/graphql_request'
import wxPay from '../../../utils/wxPay'
import storage from '../../../utils/storage'
import router from '../../../utils/nav.js'
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
    this.reLoad = true //控制onShow数据刷新
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
    let userId = storage.get('userId')
    if (this.unionId && !userId) {
      yield this.loopUserId()
    } else {
      this.userId = userId
    }
    // 分享
    this.shareUserId = query.share_user_id ? query.share_user_id : null
    event.on('Authorize', this, () => {
      this.unionId = storage.get('unionId')
      this.userId = storage.get('userId')
    })
  }),

  onShow: co.wrap(function*() {
    this.reLoad && this.loopGetOpenId()
  }),

  // 课程分享，用户打开无unionId，跳转授权
  authCheck: co.wrap(function*() {
    if (!this.unionId) {
      router.navigateTo('/pages/authorize/index', {
        share_user_id: this.shareUserId
      })
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
      isFixedNav: isFixedNav
    })
  },

  toExclusive: co.wrap(function*(e) {
    let index = e.currentTarget.id,
      supplys = this.data.supplyTypes,
      alias = supplys[index].alias
    
    router.navigateTo('/pages/cart/transit/transit', {
      pageType: 'goodsDetail',
      goodsId: alias,
      openId: app.openId,
      shopId: this.data.shopId,
      appId: this.data.appId
    })
    this.reLoad = false
  
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
      this.reLoad
    }
  },

  unfoldChapter: co.wrap(function*(e) {
    let index = Number(e.currentTarget.id),
      preFoldStatus = this.data.course.course_chapters[index].unfoldChapter,
      unfoldTarget = "course.course_chapters[" + index + "].unfoldChapter"
    this.setData({
      [unfoldTarget]: !preFoldStatus
    })
  }),

  unfoldChapterAll: co.wrap(function*(e) {
    let index = Number(e.currentTarget.dataset.index),
      unfoldAllTarget = "course.course_chapters[" + index + "].unfoldChapterAll"
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
        this.reLoad = true
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
      this.reLoad = false
      if (this.data.canShare && this.unionId) {
        let id = this.sn
        wx.request({
          url: `${app.apiServer}/boxapi/v2/course_base/share/${id}`,
          method: 'post',
          dataType: 'json',
          data: {
            'openid': app.openId
          }
        })
        return {
          title: '你好，我想学这个，帮帮我！',
          path: `/pages/package_course/share_course/share_course?sn=${this.shareSn}&share_user_id=${this.userId}`
        }
      } else if (this.unionId) {
        return {
          title: '这个课程好棒啊 快来看看吧',
          path: `/pages/package_course/course/course?sn=${this.sn}&share_user_id=${this.userId}`
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
        let resp = null,
          isCollected = this.data.isCollected
        if (isCollected) {
          resp = yield api.deleteCollectCourse(app.openId, this.sn, 'course')
        } else {
          resp = yield api.collectCourse(app.openId, this.sn, 'course')
        }
        if (resp.code !== 0) {
          throw (resp)
        }
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
      let sn = this.sn
      let resp = yield api.getCourseDetail(app.openId, sn)
      if (resp.code !== 0) {
        throw (resp)
      }
      let temp = resp.res,
        course = temp.course,
        lastStudySn = course.last_course_chapter_sn
      course.introduction = course.introduction.replace(/alt=""/g, `style="max-width:100%;vertical-align:middle;"`)
      for (let i = 0; i < course.course_chapters.length; i++) {
        let unfoldChapter = false
        if (course.course_chapters[i].sn == lastStudySn) {
          unfoldChapter = true
        }
        course.course_chapters[i].unfoldChapter = unfoldChapter
        course.course_chapters[i].unfoldChapterAll = false
      }
      course.display_price = (temp.discount.price / 100).toFixed(2)
      this.setData({
        course: course,
        isCollected: temp.course_collected,
        canShare: temp.user_can_share_to_trial,
        supplyTypes: temp.supply_types,
        loadReady: true
      })
      this.setData({
        title: course.name
      })
      this.shareSn = temp.sn
      this.showCodeCourseModal(course.code)
        // 切换tab
      this.displayTab(course.payed)
      this.longToast.toast()
    } catch (error) {
      this.longToast.toast()
      util.showError(error)
    }
  }),

  // 获取用户id
  getUserId: co.wrap(function*() {
    try {
      const resp = yield request({
        url: `${app.apiServer}/ec/v2/users/user_id`,
        method: 'GET',
        dataType: 'json',
        data: {
          openid: app.openId
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      wx.setStorageSync('userId', resp.data.user_id)
      this.userId = resp.data.user_id
    } catch (e) {
      console.error(e)
    }
  }),

  loopUserId: co.wrap(function*() {
    let loopCount = 0
    if (app.openId) {
      this.getUserId()
    } else {
      setTimeout(() => {
        loopCount++
        if (loopCount <= 100) {
          this.loopUserId()
        } else {
          console.log('loop too long, stop')
        }
      }, 1000)
    }
  }),

  loopGetOpenId: co.wrap(function*() {
    let loopCount = 0
    if (app.openId) {
      yield this.getCourseDetail()
    } else {
      setTimeout(() => {
        loopCount++
        if (loopCount <= 100) {
          this.loopGetOpenId()
        } else {
          console.log('loop too long, stop')
        }
      }, 1000)
    }
  }),

  onUnload() {
    event.remove('Authorize', this)
  }
})