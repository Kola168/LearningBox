import {
  regeneratorRuntime,
  co,
  util
} from '../../../utils/common_import'
const app = getApp()
import graphql from '../../../network/graphql_request'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_course/issue_center/issue_center')
import router from '../../../utils/nav'
import commonRequest from '../../../utils/common_request'
Page({
  data: {
    sn: null, //课程id
    loading: false, //loading状态
    usePoints: true,
    paymentOrder: null, //订单支付信息
  },
  
  onLoad: co.wrap(function * (options) {
    var _this = this
    _this.longToast = new app.weToast()
    _this.data.sn = options.sn || ''
    yield _this.getCourses()
    yield _this.payOrder()
  }),

  switchPoints: function () {
    this.setData({
      usePoints: !this.data.usePoints
    })
  },
  
  payOrder: co.wrap(function *(params) {
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

  getCourses: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后'
    })
    try {
      var resp = yield graphql.getCourseDetail(this.data.sn)
      this.setData({
        courseInfo: resp.course
      })
    } catch (err) {
      logger.info(err)
    } finally {
      this.longToast.hide()
    }
  }),

  // 提交订单
  submitOrder: co.wrap(function* (e) {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      commonRequest.createPayment(this.data.paymentOrder.sn, ()=>{
        this.longToast.hide()
        this.paySuccess()
      },(err)=>{
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
      router.redirectTo('/pages/package_course/pay_success/pay_success', {
        tag: 'course',
        sn: _this.data.sn
      })
    })
  }),

  nextTick: function (fn) {
    return new Promise(function (resolve, reject) {
      fn();
      setTimeout(resolve, 1500)
    })
  }
})