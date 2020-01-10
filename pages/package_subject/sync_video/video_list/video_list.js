// pages/package_subject/sync_video/video_list/video_list.js
var app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
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
  },

  onLoad: function (options) {

  },
  /**
   * 跳转播放详情
   */
  toVideo: function ({currentTarget: {dataset: {sn}}}) {
    var member = this.selectComponent('#memberToast')
    member.showToast()
    // wxNav.navigateTo("../video_detail/video_detail", {
    //   sn
    // })
  },

  onHide: function () {

  },

  onReachBottom: function () {

  }
})