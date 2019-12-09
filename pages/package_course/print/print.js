"use strict"

const app = getApp()
import { regeneratorRuntime, co, util } from '../../../utils/common_import'
import api from '../../../network/restful_request'
import commonRequest from '../../../utils/common_request'
import storage from '../../../utils/storage'
import router from '../../../utils/nav.js'
Page({
  data: {
    lessonImgs: [],
    allCheck: true,
    count: 0,
    loadReady: false,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    }
  },

  onLoad(query) {
    this.sn = query.sn
    this.longToast = new app.weToast()
    this.getLessonDetail()
  },
  onShow: function() {
    let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },

  zoomImg(e) {
    let index = Number(e.currentTarget.id),
      url = this.data.lessonImgs[index].imgObj.url + '?x-image-process=image/quality,q_100/watermark,image_bWljcm8vRXBib3gvc2h1aXlpbi9zaHVpeWluX25ldy5wbmc=,t_100,g_center'
    wx.previewImage({
      urls: [url]
    })
  },

  checkImg(e) {
    let imgsLen = this.data.lessonImgs.length,
      isOne = imgsLen === 1 ? true : false
    if (isOne) return
    let index = Number(e.currentTarget.id),
      isCheck = e.currentTarget.dataset.check,
      count = this.data.count,
      checkObj = "lessonImgs[" + index + "].isCheck",
      allCheck = this.data.allCheck
    count = isCheck ? count - 1 : count + 1
    allCheck = count === imgsLen ? true : false
    this.setData({
      [checkObj]: !isCheck,
      count: count,
      allCheck: allCheck
    })
  },

  allCheck() {
    let imgs = this.data.lessonImgs,
      allCheck = !this.data.allCheck,
      count = allCheck ? imgs.length : 0
    for (let i = 0; i < imgs.length; i++) {
      imgs[i].isCheck = allCheck
    }
    this.setData({
      lessonImgs: imgs,
      count: count,
      allCheck: allCheck
    })
  },

  toConfirm() {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }
    if (this.data.count === 0) {
      return wx.showToast({
        title: '请先选择需要打印的图片',
        icon: 'none'
      })
    }
    let hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.print()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  },

  print: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading',
      title: '请稍等'
    })
    try {
      let imgs = this.data.lessonImgs,
        imgIds = []
      let len = imgs.length
      for (let i = 0; i < len; i++) {
        if (imgs[i].isCheck) {
          imgIds.push(imgs[i].imgObj.id)
        }
      }
      let params = {
        openid: app.openId,
        media_type: this.mediaType,
        resourceable: {
          type: this.sourceType,
          sn: this.sn,
          ids: imgIds
        },
        from: 'mini_app',
      }
      let resp = yield commonRequest.printOrders(params)
      if (resp.code !== 0) {
        throw (resp)
      }

      // 课程详情页刷新数据
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2]
      prevPage.reLoad = true
      this.longToast.hide()
      router.redirectTo('/pages/finish/index', {
        type: course,
        media_type: '',
        state: resp.order.state
      })
    } catch (error) {
      this.longToast.hide()
      util.showErroror(error)
    }
  }),

  getPhoneNumber: co.wrap(function*(e) {
    yield app.getPhoneNum(e)
    storage.put("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.toConfirm()
  }),

  getLessonDetail: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading',
      title: '请稍等'
    })
    try {
      let resp = yield api.getLessonDetail(app.openId, this.sn)
      if (resp.code !== 0) {
        throw (resp)
      }
      let contents = resp.res.course_lesson.contents,
        reContents = [],
        len = contents.length
      for (let i = 0; i < len; i++) {
        let obj = {
          imgObj: contents[i],
          isCheck: true
        }
        reContents.push(obj)
      }
      this.setData({
        lessonImgs: reContents,
        count: len,
        loadReady: true
      })
      this.mediaType = resp.res.media_type
      this.sourceType = resp.res.source_type
      this.longToast.hide()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  })
})