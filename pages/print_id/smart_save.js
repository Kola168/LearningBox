const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../utils/common_import.js'
import api from '../../network/restful_request.js'
import commonRequest from '../../utils/common_request'
import memberGql from '../../network/graphql/member'
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
const event = require('../../lib/event/event')
const imginit = require('../../utils/imginit')
import gql from '../../network/graphql_request.js'
const downloadFile = util.promisify(wx.downloadFile)
const getSetting = util.promisify(wx.getSetting)
const authorize = util.promisify(wx.authorize)

Page({
  data: {
    canSave: true,
    allowCamera: 0,
    modalObj: {
      isShow: false,
      hasCancel: false,
      title: '',
      content: '',
      confirmText: '确认'
    }
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    this.userSn = storage.get('userSn')
    if (!this.userSn) {
      return router.navigateTo('/pages/authorize/index')
    }

    this.query = JSON.parse(options.params)
    this.sn = this.query.sn
    logger.info('预览页参数', this.query)
    this.setData({
      singleImg: this.query.wm_url,
      print_wm_url: this.query.print_wm_url ? imginit.addProcess(this.query.print_wm_url, '/rotate,90') : ''
    })
    logger.info('预览页参数', this.query)
    if (options.hasPay != 'true') {
      this.getWorkerSn()
    }
    this.getAuth()
  }),
  getWorkerSn: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后'
    })
    try {
      let resp = yield gql.certService(this.sn)
      if (resp.certService.url == '') {
        setTimeout(() => {
          this.getWorkerSn()
        }, 3000)
        return
      } else if (resp.certService.url) {
        this.longToast.hide()
        let url = resp.certService.url != '' ? imginit.addProcess(resp.certService.url, '/rotate,90') : ''
        this.setData({
          print_wm_url: url,
          singleImg: resp.certService.singleUrl
        })
      }
    } catch (e) {
      util.showError(error)
      this.longToast.hide()
    }
  }),

  getAuth: co.wrap(function* () {
    try {
      let setting = yield getSetting()
      let camera = setting.authSetting['scope.writePhotosAlbum']
      if (camera === undefined) {
        this.allowCamera = 0
        let auth = yield authorize({
          scope: 'scope.writePhotosAlbum'
        })
        this.allowCamera = 2
      } else if (camera === false) {
        this.allowCamera = 1
      } else {
        this.allowCamera = 2
      }
      this.setData({
        allowCamera: this.allowCamera
      })
      console.log(' 0 未授权 1，授权失败， 2 已授权', this.allowCamera)
    } catch (e) {
      console.log('获取授权/授权失败', e)
      this.allowCamera = 1
      this.setData({
        allowCamera: this.allowCamera
      })
    }
  }),
  authBack: function (e) {
    console.log(e)
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      return
    }
    this.setData({
      allowCamera: 2
    })
    this.savePhoto(e)
  },
  //保存图片
  savePhoto: co.wrap(function* (e) {
    let id = e.currentTarget.id
    let url = id == 'single' ? this.data.singleImg : this.data.print_wm_url
    let data = yield downloadFile({
      url
    })
    wx.saveImageToPhotosAlbum({
      filePath: data.tempFilePath,
      success(res) {
        wx.showModal({
          title: '提示',
          content: '保存成功',
          showCancel: false,
          confirmColor: '#fae100'
        })
      },
      fail(e) {
        wx.showModal({
          title: '保存失败',
          content: '请稍后重试',
          showCancel: false,
          confirmColor: '#fae100',
        })
      }
    })
  }),
  onShareAppMessage() {

  }
})