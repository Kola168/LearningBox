"use strict"

const app = getApp()
import { regeneratorRuntime, co, util } from '../../../utils/common_import'
import graphql from '../../../network/graphql_request'
import storage from '../../../utils/storage'
import router from '../../../utils/nav.js'
Page({
  data: {
    lessonImgs: [],
    featureKey: null,
    allCheck: true,
    count: 0,
    loadReady: false,
    isFullScreen: false,
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
    this.setData({
      isFullScreen: app.isFullScreen,
    })
  },

  zoomImg(e) {
    let index = Number(e.currentTarget.id),
      url = this.data.lessonImgs[index].imgObj.url + '?x-image-process=image/watermark,image_L21pY3JvL0xldmlhdGhhbi9iYWNrZW5kL3dhdGVybWFya2VyLnBuZw==,g_center/resize,w_700'
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
      var imgs = this.data.lessonImgs,
          imgIds = []
      var len = imgs.length
      for (let i = 0; i < len; i++) {
        if (imgs[i].isCheck) {
          imgs[i]._id && imgIds.push(Number(imgs[i]._id))
        }
      }

      var params = {
        resourceAttribute: {
          resourceType: 'CourseLesson',
          sn: this.sn,
          attachmentIds: imgIds
        },
        resourceOrderType: 'Course',
        featureKey: this.data.featureKey
      }
      const resp = yield graphql.createResourceOrder(params)
      this.longToast.hide()
      router.redirectTo('/pages/finish/index', {
        type: 'course',
        media_type: 'course',
        state: resp.createResourceOrder.state
      })
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  }),

  getLessonDetail: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading',
      title: '请稍等'
    })
    try {
      let resp = yield graphql.getCourseLesson(this.sn)
      let contents = resp.courseLesson.contents,
        reContents = [];
      for (let i = 0; i < contents.length; i++) {
        let obj = {
          url: contents[i].nameUrl,
          _id: contents[i].id,
          isCheck: true
        }
        reContents.push(obj)
      }
      this.setData({
        featureKey: resp.courseLesson.featureKey,
        lessonImgs: reContents,
        count: contents.length,
        loadReady: true
      })
      // this.mediaType = resp.res.media_type
      // this.sourceType = resp.res.source_type
      this.longToast.hide()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  })
})
