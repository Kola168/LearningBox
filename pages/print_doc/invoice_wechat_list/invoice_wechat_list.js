"use strict"
const app = getApp()

import api from '../../../network/restful_request'
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const _ = require('../../../lib/underscore/we-underscore')
import storage from '../../../utils/storage'
import router from '../../../utils/nav'
import { uploadDocs } from '../../../utils/upload'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/print_doc/invoice_wechat_list/invoice_wechat_list')

const downloadFile = util.promisify(wx.downloadFile)
const chooseMessageFile = util.promisify(wx.chooseMessageFile)
const openDocument = util.promisify(wx.openDocument)


Page({
  data: {
    allCount: 0,
    uploadFiles: [],
    files: [],
    showInterceptModal: '',
    isCleared: false,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    }
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    let arrayFile = JSON.parse(decodeURIComponent(options.arrayFile))
    this.beforeUpload(arrayFile)
  }),

  onShow: function () {
    let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },

  filterNotify: function () {
    let _this = this
    _this.setData({
      showInterceptModal: '只支持pdf发票,其它文件已为您过滤',
    })
    setTimeout(function () {
      _this.setData({
        showInterceptModal: '',
      })
    }, 2000)
  },

  beforeUpload: function (files) {
    let tempFiles = _(files).clone()
    let clearFiles = util.clearPdfFile(tempFiles)
    if (clearFiles.length == 0) {
      this.filterNotify()
    } else {
      this.setData({
        isCleared: files.length === clearFiles.length ? false : true
      })
      this.uploadMessageFile(clearFiles)
    }
  },

  uploadMessageFile: co.wrap(function* (urls) {
    let cloneUrls = _(urls).clone()
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    var _this = this
    let uploadFiles = []
    try {
      yield uploadDocs(urls, function (url, name) {
        let fileItem = {
          url: url,
          filename: name
        }

        logger.info('返回来的url,name====', url, name)

        if (url != '') {
          uploadFiles.push(fileItem)
          let cloneFiles = _(_this.data.files).clone()
          cloneFiles.push(fileItem)
          _this.setData({
            files: cloneFiles
          })
        }
        logger.info('uploadFiles=======', uploadFiles, uploadFiles.length, cloneUrls.length)

        if (uploadFiles.length == cloneUrls.length) {
          logger.info('uploadFiles=======', uploadFiles)
          _this.setData({
            allCount: _this.data.allCount + uploadFiles.length,
          })
          _this.covertPdf()
          if (_this.data.isCleared) {
            _this.filterNotify()
          }
        }
      })
    } catch (e) {
      _this.longToast.hide()
      util.showErr(e)
    }
  }),

  covertPdf: co.wrap(function* () {
    let covertUrls = this.data.files.map(item=>item.url)
    logger.info('covertUrls=====', covertUrls)
    try {
      const resp = yield api.covertInvoiceToPdf(app.openId, covertUrls)
      if (resp.code != 0) {
        throw (resp)
      }
      logger.info('转化链接成功=====', resp)
      let tempFiles = _(this.data.files).clone()
      tempFiles.forEach((item, index) => {
        item.url = resp.convert_urls[index],
          item.number = 1,
          item.rotate = true,
          item.color = 'Color'
      });
      this.setData({
        files: tempFiles
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  chooseFile: co.wrap(function* () {
    if (this.data.files.length >= 5) {
      return wx.showModal({
        content: '每次最多选择5个文档',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
    }
    var leftLength = 5 - this.data.files.length
    var files = yield chooseMessageFile({
      type: 'file',
      count: leftLength
    })
    this.beforeUpload(files.tempFiles)

  }),

  confirm: co.wrap(function* (e) {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }

    if (this.data.allCount <= 0) {
      return wx.showModal({
        content: '至少选择一个文档打印',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
    }
    var hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.print()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  }),

  getPhoneNumber: co.wrap(function* (e) {
    yield app.getPhoneNum(e)
    storage.put("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.confirm(e)
  }),

  print: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      logger.info('发票提交打印参数=====', this.data.files)
      const resp = yield api.printInvoice(app.openId, 'invoice', this.data.files)
      if (resp.code != 0) {
        throw (resp)
      }
      logger.info('提交打印成功=====', resp)
      this.longToast.hide()
      router.redirectTo('', {
        type: 'invoice',
        media_type: 'invoice',
        state: resp.order.state
      })
      // wx.redirectTo({
      //   url: `/pages/finish/index?type=invoice&media_type=invoice&state=${resp.order.state}`
      // })
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  preview: co.wrap(function* (e) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      let previewObj = yield downloadFile({
        url: this.data.files[parseInt(e.currentTarget.id)].url
      })
      let previewUrl = previewObj.tempFilePath
      yield openDocument({
        filePath: previewUrl
      })
      util.hideToast(this.longToast)
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  close: co.wrap(function* (e) {
    util.deleteOneId(this.data.files, this.data.files[e.currentTarget.id])
    this.setData({
      files: this.data.files,
      allCount: this.data.allCount - 1
    })
  }),
})