// pages/account/feedback.js
"use strict"

const app = getApp()
const downloadFile = util.promisify(wx.downloadFile)
import Logger from '../../../../utils/logger'
const logger = new Logger.getLogger('pages/package_common/order_record/order/order')
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
import commonRequest from '../../../../utils/common_request'
import graphql from '../../../../network/graphql/common'
Page({
  data: {
    canSave: false,
    statusInfo: null,
    update_time: '00:00:00',
    isEmpty: false,
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    var order_sn = this.order_sn = options.sn || ''
    this.getAuthStatus()
    
    order_sn && this.getOrderInfo(order_sn)
  },

  /**
   * 获取订单详情
   */
  getOrderInfo: co.wrap(function *(sn){
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      var resp = yield graphql.getPaymentOrderDetails(sn)
      var paymentOrder = resp.currentUser.paymentOrders[0]
      this.setData({
        orderDetails: paymentOrder,
        isEmpty: !paymentOrder,
        orderStatus: this.utilsOrderStatus(paymentOrder.state)
      })

      if (paymentOrder.state != 'init') {
        return
      }
      this.countDown(paymentOrder.createdAt.replace(/-/g,'/'), (time)=>{
        this.setData({
          update_time: time,
        })
      }, ()=>{
        this.getOrderInfo(sn)
      })
    } catch(err) {
      util.showError(err)
    } finally {
      this.longToast.toast()
    }
  }),

  /**
   * 获取授权状态
   */
  getAuthStatus: function () {
    wx.getSetting({
      success: (res)=> {
        var canSave = false
        if (res.authSetting && res.authSetting['scope.writePhotosAlbum']) {
            canSave = true
        }
        this.setData({
            canSave: canSave
        })
      }
    })
  },

  /**
   * 跳转支付
   */
  toPay: co.wrap(function *(){
    this.longToast.toast({
      type: 'loading',
      title: '发起支付'
    })
    try {
      var orderPms = this.data.orderDetails
      var payment = yield commonRequest.createPayment(orderPms.sn, (res)=>{
        this.longToast.hide()
        this.getOrderInfo(this.order_sn) // 更新当前状态
      }, (err)=>{
        this.longToast.hide()
        util.showError(err)
      })
    } catch(err) {
      this.longToast.hide()
      console.log(err)
    } finally {
      this.longToast.hide()
    }
  }),

  /**
   * 查看内容详情
   */
  contentDetail: function() {
    try {
      var orderDetails = this.data.orderDetails
      let params=JSON.stringify({
          print_wm_url: orderDetails.payable.url,
          wm_url: orderDetails.payable.singleUrl,
          orderSn: orderDetails.sn,
          discountInfo: orderDetails.payable.discountInfo,
          price: orderDetails.amountYuan,
          size: orderDetails.payable.size,
          name: orderDetails.payable.name,
          hasPay: orderDetails.state == 'paid' ? true : false
        })
      if (orderDetails.payable.categoryName == 'CertService') {
        wxNav.navigateTo('pages/print_id/smart_preview',{
          params
        } )
      }else if (orderDetails.payable.categoryName == 'Course') {
        wxNav.navigateTo('/pages/package_course/course/course', {
          sn: orderDetails.payable.sn
        })
      }
    } catch (err) {
      logger.info(err)
    }
  },

  countDown(createdAt, callback = function() {}, countStop = function() {}) {
    var _this = this
		var end_ts = (new Date(createdAt)).getTime() + (15 * 60 * 1000)
		var format = function(num) {
			return +num >= 10 ? num : ('0' + num)
		}
		var count = function(end_ts) {
			var now_ts = (new Date()).getTime()
			if (now_ts > end_ts) {
        countStop.apply(_this)
        return _this.timer && clearTimeout(_this.timer)
      }
			var hh = Math.floor((end_ts - now_ts) / 1000 / 60 / 60)
			var mm = Math.floor((end_ts - now_ts) / 1000 / 60 % 60)  
			var ss = Math.floor((end_ts - now_ts) / 1000 % 60)
			var time = `${format(hh)}:${format(mm)}:${format(ss)}`
			_this.timer = setTimeout(count.bind(null, end_ts), 1000)
			callback.apply(_this, [time])
		}
		return count(end_ts)
  },

  /**
   * 授权回调
   */
  authAlbum: co.wrap(function*(e) {
    if (e.detail.authSetting['scope.writePhotosAlbum'] == false) {
      return 
    }
    this.setData({
      canSave: true
    })
    this.savePhoto()
  }),

  /**
   * 保存图片
   */
  savePhoto: co.wrap(function*(e) {
    let url = this.data.orderDetails.payableItem.icon
    let data = yield downloadFile({url})
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

  /**
   * 处理订单状态
   * @param {*} key 
   */
  utilsOrderStatus: function(key) {
    var statusMaps = {
      init : {
        name: '待支付',
        status_type: 'init',
        className: 'un_pay',
        icon: '../../images/icon_unpay.png'
      },
      paid: {
        name: '支付成功',
        status_type: 'paid',
        className: 'paid',
        icon: '../../images/icon_payed.png'
      },
      canceled: {
          name: '已取消',
          status_type: 'canceled',
      },
      error: {
        name: '支付异常',
        status_type: 'error',
      }
    }
    return statusMaps[key] ? statusMaps[key] : null
  },

  toRecommendCourse: function () {
    wxNav.switchTab('/pages/course/index')
  },

  onHide: function(){
    this.timer && clearTimeout(this.timer)
  },

  onUnload: function () {
    this.timer && clearTimeout(this.timer)
  }
})
