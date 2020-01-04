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
import commonRequest from '../../../utils/common_request'
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
    // try {
    //   var _this = this
    //   yield _this.getPayment()
    // } catch (err) {
    //   logger.info(err)
    // }
    this.longToast.toast({
      type: 'loading'
    })
      commonRequest.createPayment(this.data.sn,'course','wechat_miniapp',()=>{
        this.longToast.hide()
        // ...
      },(err)=>{
        this.longToast.hide()
        util.showError(err)
      })
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
        sn: _this.data.sn,
        type: "course",
      }
      var payment =  yield graphql.getPaymentCheck(params)
      var isFree = payment.currentUser.paymentCheck && payment.currentUser.paymentCheck.free

      if (isFree) {
        yield graphql.createResource(params)
      } else {
        var payOrder = yield graphql.createPaymentOrder(params)
        var resp = yield graphql.createPayment({
          paymentSn: payOrder.createPaymentOrder.paymentOrder.sn,
          paymentMethod: "wechat_miniapp"
        })

        var payParams = resp.payParams
        console.log(payParams,'==payParams==')
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