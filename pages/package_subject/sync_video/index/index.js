// pages/package_subject/sync_video/index/index.js
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
    currentTabIndex: 0,
    subjectList: [
      {
        subjectName: '语文',
        sn: 1
      },
      {
        subjectName: '语文',
        sn: 1
      },
      {
        subjectName: '语文',
        sn: 1
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 选择科目
   */
  chooseSubject: co.wrap(function*({currentTarget: {dataset: {index}}}){
    this.setData({
      currentTabIndex: index
    })
  }),

  toVideo: function({currentTarget: {dataset: {sn}}}) {
    wxNav.navigateTo("../video_list/video_list", {
      sn
    })
  },

  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})