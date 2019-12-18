// pages/package_feature/print_sticker/preview.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const event = require('../../../lib/event/event')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'

const showModal = util.promisify(wx.showModal)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)
const downloadFile = util.promisify(wx.downloadFile)
const getSetting = util.promisify(wx.getSetting)
const request = util.promisify(wx.request)
Page({

  data: {
    count: 1,
    savable: true,
    isShare: false,
    compoundImg: null,
    url: null,
    width: 0,
    height: 0,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请确认6寸照片纸放置正确',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    }
  },
  onLoad: co.wrap(function*(query) {
    this.sn = query.sn
    if (query.share_user_id) {
      this.way = 5
      this.share_user_id = query.share_user_id
      this.setData({
        isShare: true
      })
      this.getStickerPreview()
    } else {
      let userId = wx.getStorageSync('userId')
      if (!userId || userId == undefined) {
        yield this.getUserId()
      } else {
        this.user_id = userId
      }
      this.setData({
        compoundImg: JSON.parse(decodeURIComponent(query.imgSrc))
      })
      this.url = JSON.parse(decodeURIComponent(query.imgSrc))
    }
    this.initDisplayArea()

  }),
  backIndex: function() {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  onShow: co.wrap(function*() {
    let hasAuthPhoneNum = Boolean(wx.getStorageSync('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  }),
  initDisplayArea: function() {
    try {
      let res = wx.getSystemInfoSync()
      let width = res.windowWidth - 80,
        height = width * 1.48

      this.setData({
        width: width,
        height: height
      })
    } catch (e) {
      console.log(e)
    }
  },
  getStickerPreview: co.wrap(function*() {
    console.log('this.sn', this.sn)
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    try {
      const resp = yield api.getNameStickerPreview(this.sn)
      if (resp.code != 0) {
        throw (resp)
      } else {
        wx.hideLoading()
        this.setData({
          compoundImg: resp.res.preview_url
        })
      }
    } catch (e) {
      wx.hideLoading();
      util.showErr(e)
      console.log(e)
    }
  }),
  decrease: function(e) {
    let count = this.data.count;
    if (count > 1) {
      this.setData({
        count: count - 1
      })
    }

  },
  increase: function(e) {
    let count = this.data.count;
    if (count < 99) {
      this.setData({
        count: count + 1
      })
    } else {
      showModal({
        title: '提示',
        content: '打印份数最多99张哦',
        showCancel: false,
        confirmColor: '#2086ee'
      })
    }

  },
  confirm: co.wrap(function*(e) {
    console.log('照片打印时form发生了submit事件，携带数据为：', e.detail)
    uploadFormId.dealFormIds(e.detail.formId, `print_photo_sticker`)
    uploadFormId.upload()
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }
    if (app.preventMoreTap(e)) {
      return
    }
    let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.userConfirm()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  }),
  getPhoneNumber: co.wrap(function*(e) {
    yield app.getPhoneNum(e)
    wx.setStorageSync("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.confirm(e)
  }),
  userConfirm: co.wrap(function*(e) {
    let images = [{
      url: this.url,
      pre_convert_url: this.url,
      number: this.data.count
    }]
    wx.showLoading({
      title: '正在提交',
      mask: true
    })
    try {
      // 姓名贴大头贴打印与发票打印接口通用
      const resp = yield api.printInvoice(app.openId, 'name_sticker', images)
      console.log(resp)
      if (resp.code !== 0) {
        throw (resp)
      }

      wx.hideLoading()
      console.log('订单创建成功', resp)
      wx.redirectTo({
        url: `../../../finish/index?type=name_sticker&media_type=name_sticker&state=${resp.order.state}`
      })
    } catch (e) {
      wx.hideLoading()
      util.showErr(e)
    }
  }),
  allowSave: function(e) {
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      return
    }
    this.setData({
      savable: true
    })
  },
  saveImg: co.wrap(function*() {
    console.log('this.user_id', this.user_id)
    wx.showLoading({
      title: '请稍等'
    })
    try {
      let title = '保存成功',
        content = '请到相册查看'
      let data = yield downloadFile({
        url: this.url
      })
      let tempPath = data.tempFilePath;
      yield saveImageToPhotosAlbum({
        filePath: tempPath
      })
      wx.hideLoading()
      yield showModal({
        title: title,
        content: content,
        showCancel: false,
        confirmColor: '#FFE27A'
      })
    } catch (e) {
      wx.hideLoading()
      let resp = yield getSetting()
      if (resp.authSetting['scope.writePhotosAlbum'] == false) {
        this.setData({
          savable: false
        })
        return
      }
      yield showModal({
        title: '保存失败',
        content: '请稍后重试',
        showCancel: false,
        confirmColor: '#fae100',
      })
    }
  }),

  getUserId: co.wrap(function*() {
    try {
      const resp = yield request({
        url: app.apiServer + `/ec/v2/users/user_id`,
        method: 'GET',
        dataType: 'json',
        data: {
          openid: app.openId
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      console.log('获取user_id', resp.data)
      this.user_id = resp.data.user_id
      wx.setStorageSync('userId', this.user_id)
    } catch (e) {
      console.log(e)
      // util.showErr(e)
    }
  }),
  onShareAppMessage: function(res) {
    console.log('this.sn', this.sn)
    if (res.from === 'button' || res[0].from === 'button') {
      return {
        title: "这是我的大头贴，你也想要体验吗？",
        path: `pages/package_feature/print_sticker/preview?share_user_id=${this.user_id}&sn=${this.sn}`
      }
    } else {
      return app.share
    }
  },
})