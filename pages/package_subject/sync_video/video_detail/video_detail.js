// pages/package_subject/sync_video/video_detail/video_detail.js

var app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/subject'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    video: null
  },

  onLoad: function (options) {
    var video = JSON.parse(decodeURIComponent(options.video))
    console.log(video,'==video==')
    this.setData({
      video
    })
    this.isPlay = false //是否播放
  },

  createVideoRecord: co.wrap(function*(){
    try {
      var resp = yield graphql.createVideoRecord({
        videoId: this.data.video.sn,
        videoName: this.data.video.name,
        subjectId: +this.data.video.subjectId,
        stageSn: this.data.video.stageSn
      })
    } catch(err) {
      console.log(err)
    }
  }),

  bindplay: function() {
    if(!this.isPlay) {
      this.createVideoRecord()
    }
    this.isPlay = true
  },

  bindended: function() {
    this.isPlay = false
  },

  onHide: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})