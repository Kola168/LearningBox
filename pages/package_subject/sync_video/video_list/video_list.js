// pages/package_subject/sync_video/video_list/video_list.js
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
    modal: {
      isShow: true,
      title: '开通学科会员 海量学习视频免费看',
      slotContent: false,
      content: '名师视频同步全国多个教材版本',
      image: 'https://cdn-h.gongfudou.com/LearningBox/subject/video_member_banner.png',
      slotBottom: true
    },
    videoList: []
  },

  onLoad: function (options) {
    this.videoId = options.sn
    this.stageSn = options.stageSn
    this.subjectId = options.subjectId
    this.longToast = new app.weToast()
    this.page = 1
    this.getVideoList()
  },

  /**
   * 获取视频列表
   * @param {*} param0 
   */
  getVideoList: co.wrap(function * (){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getvideoDetailList(+this.videoId, this.page, 10)
      var videoList = resp.xuekewangVideoList
      if (videoList && videoList.length >= 10) {
        this.page++
      }
      this.setData({
        videoList: this.data.videoList.concat(videoList)
      })

    } catch(err) {
      util.showError(err)
    } finally {
      this.longToast.hide()
    }
  }),

  /**
   * 跳转播放详情
   */
  toVideo: function ({currentTarget: {dataset: {item}}}) {
    var member = this.selectComponent('#memberToast')
    member.showToast()
    wxNav.navigateTo("../video_detail/video_detail", {
      video: encodeURIComponent(JSON.stringify({
        name: item.name,
        videoPath: item.videoPath,
        sn: item.id,
        stageSn: this.stageSn,
        subjectId: this.subjectId,
      }))
    })
  },

  onHide: function () {

  },

  onReachBottom: function () {
    this.getVideoList()
  }
})