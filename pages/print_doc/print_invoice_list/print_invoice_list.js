"use strict"
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const _ = require('../../../lib/underscore/we-underscore')
import storage from '../../../utils/storage'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
import api from '../../../network/restful_request'
import commonRequest from '../../../utils/common_request'
const logger = new Logger.getLogger('pages/print_wx_setting/print_wx_setting')
Page({
  data: {
    count: 0,
    invoiceList: [],
    newInvoice: [],
    isFullScreen: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    }
  },

  onLoad (options) {
    this.longToast = new app.weToast()
    var invoiceList = JSON.parse( decodeURIComponent(options.invoiceList)) //解析得到集合

    this.getDetail(invoiceList)
    this.setData({
      invoiceList: invoiceList,
      isFullScreen: app.isFullScreen
    })
  },

  preview: co.wrap(function* (e) {
    if (app.preventMoreTap(e)) {
      return;
    }
    var furl = this.data.newInvoice[e.currentTarget.id].convert_url
    wx.downloadFile({
      url: furl.url,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          fileType: 'pdf',
          success: function (res) {
            logger.info('***********resresres', res)
          }
        })
      }
    })
  }),

  delete: co.wrap(function* (e) {
    util.deleteOneId(this.data.newInvoice, this.data.newInvoice[e.currentTarget.id])
    this.setData({
      newInvoice: this.data.newInvoice,
      count: this.data.newInvoice.length
    })
  }),


  confirm: co.wrap(function* (e) {

    logger.info('发票打印时form发生了submit事件，携带数据为：', e, 'print_invoice')

    if (this.data.count == 0) {
      yield showModal({
        content: '至少选择一个发票打印',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
      return
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

  print: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '正在提交'
    })
    try {
      let printOneInvoice = []
      let currentData = _(this.data.newInvoice).clone()
      currentData.forEach(item => {
        printOneInvoice.push({
          originalUrl: item.convert_url.url,
          printUrl: item.convert_url.url,
          grayscale: false
        })
      })

      logger.info('发票提交打印参数', printOneInvoice)
      const resp = yield commonRequest.createOrder('invoice', printOneInvoice)
      logger.info('提交打印成功', resp)
      this.longToast.hide()
      router.redirectTo('/pages/finish/index', {
        media_type: 'invoice',
        state: resp.createOrder.state
      })
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),

  choose () {
    var _this = this
    wx.chooseInvoice({
      success: (res) => {
        _this.getDetail(res.choose_invoice_info || res.invoiceInfo)
      },
      fail: function (e) {
        logger.info('选取发票失败', e)
      }
    })
  },

  getDetail: co.wrap(function* (invoices) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    var invoiceList = JSON.parse(invoices).map(item=>{
      return {
        card_id: item.card_id,
        encrypt_code: item.encrypt_code
      }
    })
    try {
      const resp = yield api.getInvoiceInfo({
        item_list: invoiceList
      })

      if (resp.code != 0) {
        throw (resp)
      }
      var tempInvoice = resp.res.convert_urls.item_list.map(item => {
        return {
          payee: item.payee,
          title: item.user_info.title,
          fee: item.user_info.fee,
          billing_time: item.user_info.billing_time,
          convert_url: item.user_info.convert_url,
          pdf_url: item.user_info.pdf_url
        }
      })
      var newInvoice = [].concat(this.data.newInvoice, tempInvoice)
      this.setData({
        newInvoice: newInvoice,
        count: newInvoice.length
      })

      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),

})
