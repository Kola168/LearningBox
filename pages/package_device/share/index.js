import { regeneratorRuntime, co, util, wxNav } from '../../../utils/common_import'
const app = getApp()
const downloadFile = util.promisify(wx.downloadFile)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)
const showModal = util.promisify(wx.showModal)
const getSetting = util.promisify(wx.getSetting)

Page({
  data: {
    savable: true
  },
  onLoad() {
    this.weToast = new app.weToast()
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
      let title = '保存成功',
        content = '请到相册查看'
      let data = yield downloadFile({
        url: 'https://cdn-h.gongfudou.com/LearningBox/device/device_share_intro_3.png'
      })
      let tempPath = data.tempFilePath
      yield saveImageToPhotosAlbum({
        filePath: tempPath
      })
      this.weToast.hide()
      yield showModal({
        title: title,
        content: content,
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
})