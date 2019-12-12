"use strict"

const app = getApp()
import { regeneratorRuntime, co, util } from '../../../utils/common_import'
import graphql from '../../../network/graphql_request'
import router from '../../../utils/nav'

Page({
  data: {
    loadReady: false,
    courseLessonVideo: null,
    title: '',
  },

  onLoad(query) {
    this.longToast = new app.weToast()
    if (query.scene) {
      let scene = decodeURIComponent(query.scene)
      this.sn = scene.split('_')[1]
      this.getCourseVideoInfo()
    }
  },

  getCourseVideoInfo: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading',
      title: '请稍等'
    })
    try {
      let resp = yield graphql.getCourseLesson(this.sn),
        courseLessonVideo = resp.courseLesson
      this.setData({
        title: courseLessonVideo.courseName,
        loadReady: true,
        courseLessonVideo
      })
    } catch (error) {
      util.showError(error)
    } finally {
      this.longToast.hide()
    }
  }),

  backIndex() {
    router.switchTab('/pages/index/index')
  }
})