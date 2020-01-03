// pages/account/feedback.js
"use strict"

const app = getApp()
const downloadFile = util.promisify(wx.downloadFile)
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
// import wxPay from '../../../../utils/wxPay'
// import graphql from '../../../../network/graphql/common'
Page({
  data: {
    canSave: false,
    statusInfo: null,
    update_time: '00:00:00',
    isPic: false
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    // var order_sn = this.order_sn = options.sn || ''
    // this.getAuthStatus()
    
    // order_sn && this.getOrderInfo(order_sn)
  },

  getOrderInfo: co.wrap(function *(sn){
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      var resp = yield graphql.getOrderDetails(sn)
      this.setData({
        orderDetails: resp.payment,
        orderStatus: this.utilsOrderStatus(resp.payment.state)
      })
      if (resp.payment.state != 'init') {
        return
      }
      this.countDown(resp.payment.createdAt.replace(/-/g,'/'), (time)=>{
        this.setData({
          update_time: time,
        })
      }, ()=>{
        this.getOrderInfo(sn)
      })
    } catch(err) {
      console.log(err)
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
    wx.showLoading({
      title: '发起支付',
      mask: true,
    })
    try {
      var resp = yield wxPay.invokeWxPay({
        paymentSn: this.data.orderDetails.sn,
        usePoints: this.data.orderDetails.payableItem.usePoints,
      })
      console.log(resp, '===resp===')
      if (resp.action === "cancel") {
        return wx.showToast({
          title: '取消支付',
          icon: 'none',
        })
      }
      // 更新当前状态
      this.getOrderInfo(this.order_sn)
    } catch(err) {
      console.log(err)
    } finally {
      wx.hideLoading()
    }
  }),

  /**
   * 查看内容详情
   */
  contentDetail: function() {
    try {
      var item = this.data.orderDetails
      var categoryType = item.payableItem.desc.categoryType
      var type = ["cnjy_paper", "cnjy_special_paper"].indexOf(categoryType) > -1 ? '_learning' : '_fun'

      // 判断课程单独配置router
      if (["course"].indexOf(categoryType) > -1) {
        return wx.redirectTo({
          url: `/pages/learning/course/course?sn=${item.payableItem.desc.categorySn}`
        })
      }

      wx.navigateTo({
          url: `/pages/library/play_preview?title=${item.payableItem.name}&id=${item.payableItem.desc.resourceSign}&sn=${item.payableItem.desc.categorySn}&type=${type}`
      })
    } catch (e) {
      console.error(e)
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
      }
    }
    return statusMaps[key] ? statusMaps[key] : null
  },

  toRecommendCourse: function () {
    console.log('==跳转==')
  },

  onHide: function(){
    this.timer && clearTimeout(this.timer)
  },

  onUnload: function () {
    this.timer && clearTimeout(this.timer)
  }
})
