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

Page({
  url:'',
  type:'',
  info:'',
  data: {
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
    this.query = JSON.parse(options.params)
    console.log('支付页参数', this.query)
    let url
    if (options.type == 'paper') {
      url = imginit.addProcess(this.query.print_wm_url, '/rotate,90')
    } else {
      url = this.query.wm_url
    }
    this.setData({
      url: url,
      type: options.type,
      info: this.query
    })
    if (this.query.orderSn && this.query.price) {
      this.setData({
        paymentOrder:{
          amountYuan:this.query.price,
          sn:this.query.orderSn
        },
        discountInfo:this.query.discountInfo
      })
    } else {
      this.sn = this.query.sn
      yield this.payOrder()
    }
  }),

  //创建支付订单
  payOrder: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后'
    })
    try {
      var resp = yield gql.createCertPaymentOrder({
        type: 'cert',
        sn: this.sn
      })
      this.setData({
        paymentOrder: resp.createPaymentOrder.paymentOrder,
        payable: resp.createPaymentOrder.paymentOrder.payable
      })
      this.longToast.hide()
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
      type: 'loading',
      title: '请稍后'
    })
    if (this.data.paymentOrder.amountYuan == 0) {
      this.data.type == 'paper' ? this.toPrint() : this.toSave()
      return
    }
    this.longToast.toast({
      type: 'loading'
    })
    try {
      commonRequest.createPayment(this.data.paymentOrder.sn, () => {
        this.longToast.hide()
        this.paySuccess()
      }, (isCancel,err) => {
        this.longToast.hide()
        if(!isCancel){
          util.showError(err)
        }
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
      sn: this.sn
    })
  },
  toSave() {
    wxNav.redirectTo('/pages/print_id/smart_save', {
      params: JSON.stringify(this.query)
    })
  },
  onShareAppMessage() {

  },
})