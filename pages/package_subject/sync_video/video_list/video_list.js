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
import graphqlAll from '../../../../network/graphql_request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberToast: 'syncVideo',
    videoList: [],
    isSchoolAgeMember: false,
    isAndroid: false,
  },

  onLoad: co.wrap(function * (options) {
    var systemInfo = wx.getSystemInfoSync()
    this.setData({
      isAndroid: systemInfo.system.indexOf('iOS') > -1 ? false : true,
    })
    this.videoId = options.sn
    this.stageSn = options.stageSn
    this.subjectId = options.subjectId
    this.longToast = new app.weToast()
    this.page = 1
    yield this.getMember()
    yield this.getVideoList()
  }),


  /**
   * 判断是否是会员
   */
  getMember: co.wrap(function*(){
    try {
      var resp = yield graphqlAll.getUserMemberInfo()
      this.setData({
        isSchoolAgeMember: resp.currentUser.isSchoolAgeMember
      })
    } catch(err) {
      util.showError(err)
    }
  }),

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
    if (!this.data.isSchoolAgeMember) {
      var member = this.selectComponent('#memberToast')
      return member.showToast()
    }
    
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