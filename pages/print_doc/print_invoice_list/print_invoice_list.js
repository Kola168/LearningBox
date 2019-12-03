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
const logger = new Logger.getLogger('pages/print_wx_setting/print_wx_setting')
Page({
  data: {
    count: 0,
    invoiceList: [],
    newInvoice: [],
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/doc_confirm_print_a4_new.png'
    }
  },

  onLoad: function (options) {
    this.longToast = new app.WeToast()
    var invoiceList = JSON.parse(decodeURIComponent(options.invoiceList)) //解析得到集合

    this.getDetail(invoiceList)
    this.setData({
      invoiceList: invoiceList
    })
  },

  onShow: function () {
    let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },

  preview: co.wrap(function* (e) {
    if (app.preventMoreTap(e)) {
      return;
    }
    var furl = this.data.newInvoice[e.currentTarget.id].convert_url
    wx.downloadFile({
      url: furl,
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
    logger.info('***********urlurlurlurlurlurl', url)
  }),

  delete: co.wrap(function* (e) {
    util.deleteOneId(this.data.newInvoice, this.data.newInvoice[e.currentTarget.id])
    this.setData({
      newInvoice: this.data.newInvoice,
      count: this.data.newInvoice.length
    })
  }),


  confirm: co.wrap(function* (e) {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }
    logger.info('发票打印时form发生了submit事件，携带数据为：', e.detail.formId, 'print_invoice')

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

  getPhoneNumber: co.wrap(function* (e) {
    yield app.getPhoneNum(e)
    storage.set("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.confirm(e)
  }),
  print: co.wrap(function* () {
    logger.info('请求参数===', this.data.invoiceList)
    this.longToast.toast({
      type: 'loading',
      title: '正在提交'
    })
    try {
      let printOneInvoice = []
      let currentData = _(this.data.newInvoice).clone()
      currentData.forEach(item => {
        printOneInvoice.push({
          url: item.convert_url,
          number: 1,
          rotate: true,
          color: 'Color'
        })
      })

      logger.info('发票提交打印参数', printOneInvoice)

      const resp = yield request({
        url: app.apiServer + '/ec/v2/orders',
        method: 'POST',
        dataType: 'json',
        data: {
          openid: app.openId,
          media_type: 'invoice',
          urls: printOneInvoice
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      logger.info('提交打印成功', resp.data)
      this.longToast.hide()
      router.redirectTo('/finish/index', {
        type: 'invoice',
        media_type: 'invoice',
        state: resp.data.order.state
      })
      // wx.redirectTo({
      //   url: `../finish/index?type=invoice&media_type=invoice&state=${resp.data.order.state}`
      // })
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  choose: function () {
    var that = this
    let list = []
    wx.chooseInvoice({
      success: (res) => {
        if (res.choose_invoice_info != undefined) {
          list = res.choose_invoice_info
        } else {
          list = res.invoiceInfo
        }
        that.getDetail(list)
      },
      fail: function (e) {
        logger.info('选取发票失败', e)
      }
    })
  },

  getDetail: co.wrap(function* (res) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    var arr = []
    var _this = this

    var invoiceList = JSON.parse(res)
    invoiceList.forEach((item) => {
      arr.push({
        card_id: item.card_id,
        encrypt_code: item.encrypt_code
      })
    })
    logger.info('arrarrarr', arr)

    try {
      const resp = yield request({
        url: app.apiServer + `/ec/v2/orders/invoice_info`,
        method: 'POST',
        dataType: 'json',
        data: {
          openid: app.openId,
          item_list: arr
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      logger.info('resprespresprespresp2018', resp)
      let tempInvoice = []
      resp.data.data.item_list.forEach(item => {
        tempInvoice.push({
          "payee": item.payee,
          "title": item.user_info.title,
          "fee": item.user_info.fee,
          "billing_time": item.user_info.billing_time,
          'convert_url': item.user_info.convert_url,
          'pdf_url': item.user_info.pdf_url

        })
      })
      let newInvoice = _this.data.newInvoice.concat(tempInvoice)
      logger.info('newInvoice====', newInvoice, tempInvoice)

      this.setData({
        newInvoice: newInvoice
      })

      if (newInvoice.length == 0) {
        this.setData({
          count: 0
        })
      } else {
        this.setData({
          count: newInvoice.length
        })
      }
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

})