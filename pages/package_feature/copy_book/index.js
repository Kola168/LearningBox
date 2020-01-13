"use strict"
const app = getApp()

import {
  regeneratorRuntime,
  co,
  util,
  _,
  common_util
} from '../../../utils/common_import'

const getUserInfo =util.promisify(wx.getUserInfo)
import wxNav from '../../../utils/nav.js'
const event = require('../../../lib/event/event')
import graphql from '../../../network/graphql/feature'
Page({
  data: {
    num: 0,
    content: '',
    from_temp: false,
    mediumRecommend: '',
    fontType: 'kt',
    iosModal: false,
    text: '当日智能字帖生成次数已经用完，升级会员可以畅享使用'
  },
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.WeToast()
    console.log(options)
    if(app.isScope()){
      this.copybookSets()
    }
    event.on('Authorize', this, function (data) {
      this.copybookSets()
    })

  }),

  onShow: function () {
     if (!app.isScope()) {
       let url = `/pages/authorize/index`
       wxNav.navigateTo(url)
     }
  },

  copybookSets: co.wrap(function* (e) {
    this.longToast.toast({
      type:'loading'
    })
    try {
      const resp = yield graphql.getCopyBookList('copybook')
      this.setData({
        copybookSets: resp.feature.categories,
        // word_count: resp.res.statistics.word_count,
        // day_count: resp.res.statistics.day_count,
        // print_count: resp.res.statistics.print_count,
        // user_share_qrcode: resp.res.user_share_qrcode,
      })

      // if (this.data.word_count > 99999) {
      //   let word = (this.data.word / 10000).toFixed(2)
      //   this.setData({
      //     word_count: word
      //   })
      // }
      // if (this.data.day_count > 99999) {
      //   let day = (this.data.day_count / 10000).toFixed(2)
      //   this.setData({
      //     day_count: day
      //   })
      // }
      // if (this.data.print_count > 99999) {
      //   let print = (this.data.print_count / 10000).toFixed(2)
      //   this.setData({
      //     print_count: print
      //   })
      // }
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  contentinput: function (e) {
    let con = e.detail.value;
    this.setData({
      content: con,
      num: con.length
    })
  },

  // 选择字体
  chooseFont(e) {
    let fontType = e.currentTarget.id
    this.setData({
      fontType
    })
  },

  toDetail: co.wrap(function* (e) {
    let content = this.data.content.trim()
    if (content == '') {
      wx.showModal({
        title: '提示',
        content: '请输入内容',
        confirmColor: '#FFE27A',
        showCancel: false
      })
      return
    }
    this.longToast.toast({
      type:'loading'
    })
    let type = e.currentTarget.id
    try {
      let params = {
        openid: app.openId,
        type: type,
        content: content,
        version:true
      }
      if (this.data.fontType === 'lmsxk') {
        params.font = 'lmsxk'
      }

      const resp = yield api.customCopybook(params)
      if (resp.code == 80000) {
        this.longToast.toast()
        return this.setData({
          iosModal: true,
        })
      } else if (resp.code != 0) {
        throw (resp)
      }
      let sn = resp.res.sn
      let word_count = resp.res.word_count
      let images = resp.res.images
      let pdf_url = resp.res.pdf_url
      this.longToast.toast()
      wx.navigateTo({
        url: `detail?title=自定义练习&sn=${sn}&word_count=${word_count}&images=${common_util.encodeLongParams(images)}&custom=true&user_share_qrcode=${common_util.encodeLongParams(this.data.user_share_qrcode)}&pdf_url=${common_util.encodeLongParams(pdf_url)}`,
      })
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  toList: co.wrap(function* (e) {
    let title = this.data.copybookSets[e.currentTarget.id].name
    let sn = this.data.copybookSets[e.currentTarget.id].sn
    wx.navigateTo({
      url: `list?title=${title}&sn=${sn}&user_share_qrcode=${common_util.encodeLongParams(this.data.user_share_qrcode)}`,
    })
  }),

  toCommonSense: co.wrap(function* (e) {

    wx.navigateTo({
      url: `commonSense`,
    })
  }),

  toShare: co.wrap(function* (e) {
    const info = yield getUserInfo()
    wxNav.navigateTo(`/pages/package_feature/copy_book/post`,{
      user_share_qrcode:common_util.encodeLongParams(this.data.user_share_qrcode),
      word_count:this.data.word_count,
      day_count:this.data.day_count,
      print_count:this.data.print_count,
      avatarUrl:info.userInfo.avatarUrl,
      nickName:info.userInfo.nickName,
    })
  }),

  backToHome: function () {
    try {
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (e) {
      console.log(e)
    }
  },
  onUnload: function () {
    event.remove('Authorize', this)
  },
  closeIosTip: function () {
    if (this.data.iosModal) {
      this.setData({
        iosModal: false
      })
    }
  }


})
