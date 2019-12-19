import { regeneratorRuntime, co, util, wxNav, storage } from '../../../utils/common_import'
const app = getApp()
const downloadFile = util.promisify(wx.downloadFile)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)
const showModal = util.promisify(wx.showModal)
const getSetting = util.promisify(wx.getSetting)

Page({
  data: {
    savable: true,
    shareQrcode: ''
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.deviceSn = query.deviceSn
    // this.userSn = storage.get('userSn')
    this.setData({
      shareQrcode: JSON.parse(decodeURIComponent(query.shareQrcode))
    })
  },
  allowSave: function(e) {
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      return
    }
    this.setData({
      savable: true
    })
  },
  saveImg: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let data = yield downloadFile({
        url: this.data.shareQrcode
      })
      let tempPath = data.tempFilePath

      yield saveImageToPhotosAlbum({
        filePath: tempPath
      })
      this.weToast.hide()
      yield showModal({
        title: '保存成功',
        content: '请到相册查看',
        showCancel: false,
        confirmColor: '#FFDC5E'
      })
    } catch (e) {
      this.weToast.hide()
      let resp = yield getSetting()
      if (!resp.authSetting['scope.writePhotosAlbum']) {
        this.setData({
          savable: false
        })
        return
      }
      yield showModal({
        title: '保存失败',
        content: '请稍后重试',
        showCancel: false,
        confirmColor: '#FFDC5E',
      })
    }
  }),
  onShareAppMessage: function(res) {
    console.log(`/pages/index/index?deviceSn=${this.deviceSn}`)
    if (res.from === 'button' || res[0].from === 'button') {
      return {
        title: '好友分享给您一台打印设备，快快点击绑定吧',
        path: `/pages/index/index?deviceSn=${this.deviceSn}`
      }
    }
  },
})