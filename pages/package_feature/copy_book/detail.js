// pages/print_copybook/detail.js
"use strict"
const app = getApp()

import {
  regeneratorRuntime,
  co,
  util,
  _,
  common_util
} from '../../../utils/common_import'

const request = util.promisify(wx.request)
const downloadFile = util.promisify(wx.downloadFile)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)
const getUserInfo = util.promisify(wx.getUserInfo)
const event = require('../../../lib/event/event')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql/feature'

Page({
  data: {
    tabId: 1,
    custom: false, //是否自定义
    num: 0,
    circular: true,
    showConfirmModal: false,
    // user_custom: false, //是否用户分享自定义
    from_temp: false, //是否分享链接进入
    showGetModal: false,
    normalImages: '',
    strokeImages: '',
    confirmModal: {},

    type:'copyboox',  // 生成订单的type
  },
  onLoad: co.wrap(function*(options) {
    this.longToast = new app.weToast()
    console.log('options========', options)

    //分享链接进入
    if (options.from && options.from == 'share') {
      this.setData({
        title: '字帖',
      })
      this.setData({
        from_temp: true
      })
      if (options.custom == "true") {
        this.setData({
          custom: true
        })
      }
    } else {
      this.setData({
        title: options.title,
      })
    }
    this.setData({
      images: options.images ? common_util.decodeLongParams(options.images) : '',
      user_share_qrcode: options.user_share_qrcode ? common_util.decodeLongParams(options.user_share_qrcode) : '',
      name: options.name ? options.name : '',
      custom: options.custom ? options.custom : false,
      tabId: 1,
      sn:options.sn,
      type:options.type||'copybook'
    })
    console.log("22222222")
    if (options.title != '自定义练习') {
      if (app.isScope()) {
        yield this.copybookDetails()
      }

      event.on('Authorize', this, function(data) {
        this.copybookDetails()
      })
    }

  }),
  onShow: function() {
    if (!app.isScope()) {
      let url = `/pages/authorize/index`
      wxNav.navigateTo(url)
    }
  },
  copybookDetails: co.wrap(function*(e) {
    this.longToast.toast({
      type:'loading'
    })
    try {
      const resp = yield graphql.getCopyContentDetail(this.data.sn)

      console.log('字帖详情', resp)
      this.setData({
        multiple_form: _.isNotEmpty(resp.content.strokeCopybooks), //判断是否有笔顺
      })

      let normalImages = _.without(_.pluck(resp.content.normalCopybooks,'nameUrl'),undefined)
      let strokeImages = _.pluck(resp.content.strokeCopybooks,'nameUrl')
      this.setData({
        images: parseInt(this.data.tabId) === 0 || _.isEmpty(normalImages) ? strokeImages : normalImages,
        normalImages: normalImages,
        strokeImages: strokeImages
      })

      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  practice: co.wrap(function*(e) {
    let id = e.currentTarget.id
    console.log(id)
    this.setData({
      tabId: id,
      images: parseInt(id) === 0 ? this.data.strokeImages : this.data.normalImages,
      num: 0
    })
  }),

  tab_slide: function(e) {
    console.log(e.detail.current)
    this.setData({
      num: e.detail.current
    })
  },

  turnImg: co.wrap(function*(e) {
    let num = this.data.num;
    let turn = e.currentTarget.dataset.turn;
    if (turn == 'right') {
      if (num < this.data.images.length - 1) {
        num++;
      } else {
        return
      }
    } else if (turn == 'left') {
      if (num > 0) {
        num--;
      } else {
        return
      }
    }
    this.setData({
      num: num,
      turn: turn
    })
  }),

  onShareAppMessage: function(res) {
    if (res.from === 'button' || res[0].from === 'button') {
      return {
        title: "分享一个好用又方便的字帖应用给你！",
        path: `/pages/package_feature/copy_book/detail?custom=${this.data.custom}&from=share&title=${this.data.title}&name=${this.data.name}&sn=${this.data.sn}&user_share_qrcode=${common_util.encodeLongParams(this.data.user_share_qrcode)}`
      }
    } else {
      return app.share
    }
  },

  toSave: co.wrap(function*() {
    let sn = this.data.sn
    wx.showLoading({
      title: '请稍后',
      mask: true
    })
    try {
      for (var i = 0; i < this.data.images.length; i++) {
        let downLoadData = yield downloadFile({
          url: this.data.images[i]
        })
        let save = yield saveImageToPhotosAlbum({
          filePath: downLoadData.tempFilePath
        })
        if (i == (this.data.images.length - 1)) {
          wx.hideLoading()
          wx.showToast({
            title: '保存成功',
            icon: 'none'
          })
        }
      }
    } catch (e) {
      console.log(e)
      wx.hideLoading()
      wx.showModal({
        title: '错误',
        content: '保存失败',
        showCancel: false,
        confirmColor: '#6BA1F6'
      })
    }

  }),

  toConfirm: co.wrap(function*(e) {

    let info
    try {
      info = yield getUserInfo()
    } catch (error) {
      console.log('error==', error)
      return
    }
    this.setData({
      avatarUrl: info.userInfo.avatarUrl,
      nickName: info.userInfo.nickName
    })
    this.setData({
      confirmModal: {
        isShow: true,
        title: '请正确放置A4打印纸',
        image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
      },
    })

  }),

  print: co.wrap(function*() {
    this.longToast.toast({
      type:'loading'
    })

    let resp
    try {
      let params={
        resourceOrderType:this.data.type,
        featureKey:this.data.custom?'custom_copybook':'copybook',
        resourceAttribute:{
          sn:this.data.sn,
          copybookType:parseInt(this.data.tabId)==0?'stroke':'normal',
        }
      }
      resp=yield graphql.createCopyOrder(params)

      console.log('提交打印成功', resp)
      this.longToast.toast()
       wxNav.navigateTo(`pages/finish/sourcefinish`, {
           media_type:'copybook',
           state:resp.createResourceOrder.state,
           day:resp.createResourceOrder.statistic.fields[1].value,
           continueText:'继续打印'  //继续打印的文案可不传
        })
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  backToHome: function() {
    try {
      wxNav.switchTab({
        url: '/pages/index/index'
      })
    } catch (e) {
      console.log(e)
    }
  },

  //有用 试一试
  toCopybook: function(e) {
    wxNav.navigateTo(`/pages/package_feature/copy_book/index`)
  },

  onUnload: function() {
    event.remove('Authorize', this)
  },

})
