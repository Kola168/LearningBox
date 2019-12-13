import {
  regeneratorRuntime,
  co,
  util
} from '../../../utils/common_import'
const app = getApp()
import graphql from '../../../network/graphql_request'
import wxPay from '../../../utils/wxPay'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_course/issue_center/issue_center')
import router from '../../../utils/nav'
Page({
  data: {
    sn: null, //课程id
    loading: false, //loading状态
    usePoints: true,
  },
  
  onLoad: function (options) {
    var _this = this
    _this.longToast = new app.weToast()
    _this.data.sn = options.sn || ''
    _this.getCourses()
  },

  switchPoints: function () {
    this.setData({
      usePoints: !this.data.usePoints
    })
  },

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
    try {
      var _this = this
      yield _this.getPayment()
    } catch (err) {
      logger.info(err)
    }
  }),

  // 获取支付能力
  getPayment: co.wrap(function* () {
    try {
      var _this = this
      _this.setData({
        loading: true
      })
      this.longToast.toast({
        type: 'loading',
        title: '请稍后'
      })
      var params = {
        resourceInfo: {
          resourceSign: _this.data.sn,
          title: _this.data.courseInfo.name,
        },
        type: 'course',
      }
      var resp = yield graphql.createOrder(params)
      var payInfo = yield wxPay.invokeWxPay({
        paymentSn: resp.createPayment.payment.sn,
        usePoints: _this.data.usePoints,
      })
      if (payInfo.action === "cancel") {
        return wx.showToast({
          title: '取消支付',
          icon: 'none',
        })
      }
      _this.paySuccess()

    } catch (e) {
      util.showError(e)
    } finally {
      _this.setData({
        loading: false
      })
      this.longToast.hide()
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