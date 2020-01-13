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

Page({
  data: {
    kidInfo: null,
    memberTipUrl: '',
    checked: false,
    expiration: '',
    price: '',
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
    this.query = JSON.parse(options.confirm)
    this.info = JSON.parse(options.info)
    console.log('支付页参数', this.info, this.query)
    let url
    if (options.type == 'paper') {
      url = imginit.addProcess(this.query.print_wm_url, '/rotate,90')
    } else {
      url = this.query.wm_url
    }
    this.setData({
      url: url,
      type: options.type
    })

  }),
  //创建支付订单
  payOrder: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后'
    })
    try {
      var resp = yield commonRequest.createPaymentOrder(this.data.sn, 'course')
      this.setData({
        paymentOrder: resp.createPaymentOrder.paymentOrder
      })
    } catch (err) {
      util.showError(err)
      logger.info(err)
    } finally {
      this.longToast.hide()
    }

  }),
  // 提交支付
  submitOrder: co.wrap(function* (e) {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      commonRequest.createPayment(this.data.paymentOrder.sn, () => {
        this.longToast.hide()
        this.paySuccess()
      }, (err) => {
        this.longToast.hide()
        util.showError(err)
      })
    } catch (err) {
      logger.info(err)
    }
  }),
  // 支付成功
  paySuccess: co.wrap(function* () {
    var _this = this
    var obj = {
      title: '支付成功',
      icon: 'success',
      duration: 1500,
      mask: true,
    }
    _this.nextTick(wx.showToast.bind(wx, obj)).then(() => {

      if (this.data.type == 'paper') {
        this.toPrint()
      } else {
        this.toSave()
      }
    })
  }),
  nextTick: function (fn) {
    return new Promise(function (resolve, reject) {
      fn();
      setTimeout(resolve, 1500)
    })
  },
  toPrint() {
    wxNav.redirectTo('/pages/print_id/print', {
      url: JSON.stringify(this.query.print_wm_url),
      sn: '10'
    })
  },

  getMemberPaymentOrder: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      // let resp = yield memberGql.getMemberPaymentOrder(),
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),
  onShareAppMessage() {

  },
  toSave() {
    wxNav.redirectTo('/pages/print_id/smart_save', {
      confirm: JSON.stringify(this.query),
      info: JSON.stringify(this.info),
      url: JSON.stringify(this.data.url),
    })
  }
})