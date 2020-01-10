"use strict"
const app = getApp()

import {
  regeneratorRuntime,
  co,
  util,
  _,
  uploadFormId,
  common_util
} from '../../../utils/common_import'

const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const downloadFile = util.promisify(wx.downloadFile)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)

Page({
  data: {
    images: [
      "https://cdn.gongfudou.com/miniapp/ec/copybook_common5.jpg",
      "https://cdn.gongfudou.com/miniapp/ec/copybook_common6.jpg",
      "https://cdn.gongfudou.com/miniapp/ec/copybook_common7.jpg",
      "https://cdn.gongfudou.com/miniapp/ec/copybook_common8.png",
      "https://cdn.gongfudou.com/miniapp/ec/copybook_common9.png"
    ],
    word_count: 0
  },
  onLoad: function(options) {
    this.longToast = new app.WeToast()
  },
  onShow:function(){
      this.setData({
          hasPhoneNum:app.hasPhoneNum
      })
  },
  toSave: co.wrap(function*() {
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
    if(!this.data.hasPhoneNum){
        return
    }
    this.setData({
      showConfirmModal: {
        mediaType: `请正确放置A4打印纸`,
        src: `https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png`
      }
    })
  }),
  getPhoneNumber:co.wrap(function*(e){
    let getphone
    if(!this.data.hasPhoneNum){
        getphone=yield app.getPhoneNum(e)
    }else{
        getphone=true
    }
    console.log(getphone)
    if(!getphone){
        return
    }else{
        this.data.hasPhoneNum=true
        this.setData({
            hasPhoneNum:this.data.hasPhoneNum
        })
        this.toConfirm()
    }
}),

  cancelPrint: function() {
    this.setData({
      showConfirmModal: false
    })
  },

  print: co.wrap(function*() {
    this.setData({
      showConfirmModal: false
    })
    this.longToast.toast({
      img: '/images/loading.gif',
      title: '请稍候',
      duration: 0
    })

    let link = []
    for (let i = 0; i < this.data.images.length; i++) {
      let urls = {}
      urls.url = this.data.images[i]
      urls.pre_convert_url = this.data.images[i]
      urls.color = "Color"
      urls.number = "1"
      console.log("222222222", urls)
      link.push(urls)
      console.log("1111111", link)
    }
    try {
      const resp = yield api.printCopybook(app.openId, '_a4', link, this.data.word_count)
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('提交打印成功', resp)
      this.longToast.toast()
      wx.redirectTo({
        url: `/pages/finish/index?type=copy_book&media_type=copy_book&state=${resp.order.state}`
      })
    } catch (e) {
      util.hideToast(this.longToast)
      util.showErr(e)
    }
  }),
})
