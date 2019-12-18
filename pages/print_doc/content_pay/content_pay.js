"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import graphql from '../../../network/graphql_request'

const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
import wxPay from '../../../utils/wxPay'
import router from '../../../utils/nav'
import storage from '../../../utils/storage'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/print_doc/content_pay/content_pay')
Page({

  data: {
    choosePoint: false,
    showSetting: false, //显示打印设置
    documentPrintNum: 1, //打印份数
    startPrintPage: 1,
    endPrintPage: 1,
    colorCheck: 'Color', //默认彩色
    duplexCheck: false,
    isColorPrinter: true,
    isDuplex: true,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    },
    isMember: false,
    isAndroid: false,
    memberExpiresAt: null
  },

  toSetting: function () {
    this.setData({
      showSetting: true
    })
  },

  onLoad: co.wrap(function* (options) {
    try {
      this.longToast = new app.weToast()
      this.options = JSON.parse(decodeURIComponent(options.params))
      this.id = this.options.id
      this.sn = this.options.sn
      this.setData({
        isMember: this.options.isMember,
        isDuplex: this.options.isDuplex,
        isColorPrinter:  this.options.isColorPrinter,
        title: this.options.title,
        memberExpiresAt: this.options.memberExpiresAt
      })
      var systemInfo = wx.getSystemInfoSync()
      this.setData({
        isAndroid: systemInfo.system.indexOf('iOS') > -1 ? false : true
      })

      yield this.getDetail()
      let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
      this.hasAuthPhoneNum = hasAuthPhoneNum
      this.setData({
        hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
      })
    } catch (e) {
      logger.info(e)
    }
  }),

  toMember () {
    router.navigateTo('/pages/error_book/pages/account/member', {
      isMember: false
    })
    // wx.navigateTo({
    //   url: `/pages/error_book/pages/account/member?isMember=false`
    // })
  },

  //减少份数
  cutPrintNum () {
    if (this.data.documentPrintNum <= 1) {
      return
    }
    this.data.documentPrintNum -= 1
    this.setData({
      documentPrintNum: this.data.documentPrintNum
    })
  },

  //增加份数
  addPrintNum: co.wrap(function* () {
    this.data.documentPrintNum +=1
    if (this.data.documentPrintNum <= 30) {
      this.setData({
        documentPrintNum: this.data.documentPrintNum
      })
    } else {
      this.setData({
        documentPrintNum: 30
      })
      wx.showModal({
        content: '每次最多打印30份',
        confirmColor: '#FFDC5E',
        confirmText: "确认",
        showCancel: false
      })
    }

  }),

  //输入打印起始页
  inputStartPage: function (e) {
    this.data.startPrintPage = e.detail.value
  },

  startPageJudge: function ({detail: {value}}) {
    if (parseInt(value) > parseInt(this.data.endPrintPage) || parseInt(value) <= 0) {
      this.setData({
        startPrintPage: 1
      })
      return wx.showModal({
        content: '请输入正确的起始页',
        confirmColor: '#FFDC5E',
        confirmText: "确认",
        showCancel: false
      })
      
    } 

    this.data.startPrintPage = value
  },

  //输入打印结束页
  inputEndPage ({detail: {value}}) {
    this.data.endPrintPage = value
  },

  endPageJudge (e) {
    if (parseInt(e.detail.value) < parseInt(this.data.startPrintPage) || parseInt(e.detail.value) > this.data.detail.preview_urls.length) {
      this.setData({
        endPrintPage: this.data.detail.preview_urls.length,
      })
      return wx.showModal({
        content: '请输入正确的结束页',
        confirmColor: '#FFDC5E',
        confirmText: "确认",
        showCancel: false
      })
      
    } 
    this.data.endPrintPage = e.detail.value
  },

  /**
   * @methods 选择颜色
   * @param {Object} e 
   */
  colorCheck({currentTarget: {dataset: {style}}}) {
    this.setData({
      colorCheck: style
    })
  },

  /**
   * @methods 选择单双面打印模式
   * @param {Object} e 
   */
  duplexCheck(e) {
    let duplexCheck = e.currentTarget.dataset.style == 0 ? false : true
    this.setData({
      duplexCheck: duplexCheck
    })
  },

  //确认按钮提交
  confCheck() {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }
    if (this.data.startPrintPage == '') {
      return wx.showModal({
        content: '请输入正确的开始页',
        confirmColor: '#FFDC5E',
        confirmText: "确认",
        showCancel: false
      })
      
    }

    if (this.data.endPrintPage == '') {
      return wx.showModal({
        content: '请输入正确的结束页',
        confirmColor: '#FFDC5E',
        confirmText: "确认",
        showCancel: false
      })
      
    }
    let hideConfirmPrintBox = Boolean(storage.get('hideConfirmPrintBox'))
    if (hideConfirmPrintBox) {
      this.print()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  },

  cancelCheck() {
    this.setData({
      showSetting: false
    })
  },

  getPhoneNumber: co.wrap(function* (e) {
    // yield app.getPhoneNum(e)
    storage.put("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.confCheck()
  }),

  checkPoint: function () {
    let choosePoint
    if (this.data.choosePoint) {
      choosePoint = false
    } else {
      choosePoint = true
    }
    this.setData({
      choosePoint
    })
  },

  getDetail: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      let resp = yield graphql.getContentDetail(this.sn, this.id)
      resp.resource.preview_urls = JSON.parse(resp.resource.preview_urls)
      this.setData({
        detail: resp.resource,
        is_doc: resp.resource.is_doc,
        media_type: resp.resource.media_type,
        discountType: resp.resource.discount.discountType,
        discount: resp.resource.discount,
        collection: resp.resource && resp.resource.is_collected || false,
        endPrintPage: resp.resource.preview_urls.length
      })
      if (resp.resource.discount.resourceCanPoint == true && resp.resource.discount.canPoint == true) {
        this.checkPoint()
      }
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),

  toPay: co.wrap(function* () {
    if (!app.activeDevice) {
      return util.showError({message: '您还未绑定打印机，快去绑定吧'})
    }
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })

    try {
      var params = {
        resourceInfo: {
          resourceSign: this.id,
          sn: this.sn,
          title: this.data.title,
        },
        type: 'resource',
      }
      var _this = this
      var resp = yield graphql.createOrder(params)
      var resp1 = yield wxPay.invokeWxPay({
        paymentSn: resp.createPayment.payment.sn,
        usePoints: _this.data.choosePoint,
      })
      if (resp1.action === "cancel") {
        _this.longToast.toast()
        return wx.showToast({
          title: '取消支付',
          icon: 'none',
        })
      }
      _this.setData({
        showSetting: true
      })
      _this.longToast.hide()
    } catch (e) {
      _this.longToast.hide()
      util.showError(e)
    }
  }),

  print: co.wrap(function* (e) {
    try {
      if (!app.activeDevice) {
        return util.showError({message: '您还未绑定打印机，快去绑定吧'})
      }

      this.longToast.toast({
        type: 'loading',
        title: '请稍候'
      })

      var _this = this
      var resourceAble = {
        type: 'ec_content',
        sn: _this.id,
        category_sn: _this.sn,
      }
      

      var setting = {
        duplex: _this.data.duplexCheck,
        color: _this.data.colorCheck,
        number: _this.data.documentPrintNum,
        start_page: _this.data.startPrintPage,
        end_page: _this.data.endPrintPage
      }

      var params = {
        openid: app.openId,
        media_type: _this.data.media_type,
        resourceable: resourceAble,
        setting: setting,
        is_vip: true
      }

      var resp = yield request({
        url: app.apiServer + `/boxapi/v2/orders`,
        method: 'POST',
        dataType: 'json',
        data: params
      })

      if (resp.data.code == 0) {
        _this.longToast.hide()
        router.redirectTo('/pages/finish/index', {
          media_type: _this.data.media_type,
          state: resp.data.order.state,
          type: _this.options.type
        })
        // wx.redirectTo({
        //   url: `../finish/index?media_type=${_this.data.media_type}&&state=${resp.data.order.state}&&type=${_this.options.type}`
        // })
      } else if (resp.data.code == 1) {
        _this.longToast.hide()
        const res = yield showModal({
          title: '提示',
          content: resp.data.message,
          showCancel: false,
          confirmColor: '#FFDC5E',
        })
        if (res.confirm) {
          router.navigateBack()
        }
      } else {
        throw (resp.data)
      }

    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),

})