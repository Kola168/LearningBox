// pages/print_copybook/post.js
"use strict"
const app = getApp()

import {
  regeneratorRuntime,
  co,
  util,
  _,
  common_util
} from '../../../utils/common_import'

const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const downloadFile = util.promisify(wx.downloadFile)
const getSetting = util.promisify(wx.getSetting)
Page({
  data: {
    media_type: "copy_book"
  },
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    console.log(options)
    this.nickName = options.nickName
    this.avatarUrl = options.avatarUrl
    this.day_count = options.day_count
    this.word_count = options.word_count
    this.print_count = options.print_count
    this.qrSrc = common_util.decodeLongParams(options.user_share_qrcode)
    //获取系统信息
    let res = wx.getSystemInfoSync()
    console.log("sysInfo:", res)
    this.setData({
      width: res.windowWidth,
      height: res.windowHeight
    })
    console.log("屏幕宽高", this.data.width, this.data.height)
    this.canvas()
  }),
  canvas: co.wrap(function*() {
    this.setData({
      canvasWidth: this.data.width * 0.92,
      canvasHeight: this.data.width * 1.5 * 0.92
    })

    // this.longToast.toast({
    //   img: '../../images/loading.gif',
    //   title: '请稍候',
    //   duration: 0
    // })
    console.log("1111")
    this.setData({
      shareImg: 'https://cdn.gongfudou.com/miniapp/ec/copybook_poster.png'
    })

    console.log(this.avatarUrl, this.qrSrc, this.data.shareImg)
    let avatarUrl = yield downloadFile({
      url: this.avatarUrl,
    })
    let code = yield downloadFile({
      url: this.qrSrc,
    })
    let shareImg = yield downloadFile({
      url: this.data.shareImg,
    })

    this.setData({
      avatarUrl: avatarUrl.tempFilePath,
      code: code.tempFilePath,
      shareImg: shareImg.tempFilePath
    })

    try {
      let res = yield getSetting()
      console.log('授权信息', res)
      if (res.authSetting['scope.writePhotosAlbum']) {
        this.setData({
          canSave: true
        })
      } else if (res.authSetting['scope.writePhotosAlbum'] == false) {
        this.setData({
          canSave: false
        })
      }
      console.log('888', this.data.canSave)
    } catch (e) {
      console.error(e)
    }

    const ctx = wx.createCanvasContext('saveCanvas')

    let w = this.data.width * 0.92
    let h = this.data.width * 1.5 * 0.92

    //底图
    let bg = this.data.shareImg
    ctx.drawImage(bg, 0, 0, w, h)

    //小程序码
    let codeurl = this.data.code
    ctx.drawImage(codeurl, w * 0.765, h * 0.855, this.data.width * 0.15, this.data.width * 0.15)

    //头像
    let avatar = this.data.avatarUrl
    ctx.drawImage(avatar, w * 0.42, h * 0.1, this.data.width * 0.15, this.data.width * 0.15)

    let avatar_bg = "../resource_images/avatar_bg_white.png"
    ctx.drawImage(avatar_bg, w * 0.42, h * 0.1, this.data.width * 0.15, this.data.width * 0.15)

    //昵称
    ctx.setFontSize(13)
    let nickName = this.nickName
    ctx.setTextAlign('center')
    ctx.fillText(nickName, w * 0.5, h * 0.24)

    //打卡天数
    ctx.setFontSize(30)
    ctx.setFillStyle('#FA9A43')
    let day_count = this.day_count
    ctx.setTextAlign('center')
    ctx.fillText(day_count, w * 0.18, h * 0.59)

    //练习字数
    ctx.setFontSize(30)
    ctx.setFillStyle('#FA9A43')
    let word_count = this.word_count
    ctx.setTextAlign('center')
    ctx.fillText(word_count, w * 0.46, h * 0.59)

    //完成篇数
    ctx.setFontSize(30)
    ctx.setFillStyle('#FA9A43')
    let print_count = this.print_count
    ctx.setTextAlign('center')
    ctx.fillText(print_count, w * 0.8, h * 0.59)

    ctx.setFontSize(12)
    ctx.setFillStyle('#999')
    ctx.fillText('天', w * 0.3, h * 0.59)

    ctx.setFontSize(12)
    ctx.setFillStyle('#999')
    ctx.fillText('字', w * 0.63, h * 0.59)

    ctx.setFontSize(12)
    ctx.setFillStyle('#999')
    ctx.fillText('篇', w * 0.9, h * 0.59)

    let that = this
    ctx.draw(false, function() {
      console.log('6666666666')
      wx.canvasToTempFilePath({
        canvasId: 'saveCanvas',
        quality: 1,
        success: function(res) {
          console.log('000000', res.tempFilePath)
          that.setData({
            prurl: res.tempFilePath,
          })
        },
        fail: function(res) {
          console.log("fail", res)
        }
      })
    })
  }),

  savePhoto: co.wrap(function*() {
    let that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.prurl,
      success(res) {
        wx.showToast({
          title: '保存成功',
          icon: 'none'
        })
      },
      fail(e) {
        wx.showModal({
          title: '保存失败',
          content: '请稍后重试',
          showCancel: false,
          confirmColor: '#fae100'
        })
      }
    })
  }),

  onShareAppMessage: function (res) {
    console.log('userId==share===',this.user_id)
    if (res.from === 'button' || res[0].from === 'button') {
      return {
        title: "分享一个好用又方便的字帖应用给你！",
        path: `/pages/package_feature/copy_book/index`
      }
    } else {
      return app.share
    }
  },
})
