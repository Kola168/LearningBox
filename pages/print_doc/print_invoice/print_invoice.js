// pages/print_invocie/index.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const mta = require('../../../utils/mta_analysis.js');
const showModal = util.promisify(wx.showModal)
const chooseMessageFile = util.promisify(wx.chooseMessageFile)
import commonRequest from '../../utils/common_request.js'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/print_doc/print_invoice/print_invoice')

Page({
  data: {
    invoiceList: [],
    showGetModal: false, //耗材推荐弹窗
    supply_types: '',
    consumablesIcon: false, //耗材推荐图标
    mediumRecommend: ''
  },
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.WeToast()
    mta.Page.init()
    // let media_type = 'invoice'
    // this.setData({
    //   mediumRecommend: media_type
    // })
    // let getSupplyBefore = commonRequest.getSupplyBefore(media_type)
    // let that = this
    // getSupplyBefore.then(function (res) {
    //   const supply_types = res.supply_types
    //   console.log(supply_types)
    //   that.setData({
    //     supply_types: supply_types
    //   })
    // })
  }),

  scopeInvoice: co.wrap(function* () {
    let list = []
    wx.getSetting({
      success(res) {
        logger.info('执行到这里====res.authSetting', res.authSetting['scope.invoice'])
        wx.chooseInvoice({
          success(res) {
            logger.info('chooseInvoice', res)
            mta.Event.stat('fapiaodayin', {
              'invoicechoice': 'card'
            })
            if (res.choose_invoice_info != undefined) {
              list = res.choose_invoice_info
            } else {
              list = res.invoiceInfo
            }
            mta.Event.stat('fapiaodayin', {
              'media': 'card'
            })
            router.navigateTo('/pages/print_invoice_list/print_invoice_list', {
              invoiceList: encodeURIComponent(JSON.stringify(list))
            })
           
          },
          fail(res) {
            logger.info(res)
          }
        })
      }
    })
  }),
  //检查基础库版本
  checkBaseVersion: function (lowVersion) {
    const systemInfo = wx.getSystemInfoSync()
    return util.compareVersion(systemInfo.SDKVersion, lowVersion)
  },

  //发票卡包只跳转到特定的处理pdf页面
  chooseFromWeChat: co.wrap(function* () {
    var SDKVersion
    try {
      const resInfo = wx.getSystemInfoSync()
      SDKVersion = resInfo.SDKVersion
    } catch (e) {
      console.log(e)
    }
    if (util.compareVersion(SDKVersion, '2.5.0')) {
      const file = yield chooseMessageFile({
        type: 'file',
        count: 5,
      })
      const list = file.tempFiles
      wx.navigateTo({
        url: `/pages/print_invoice/list_wechat?arrayFile=${encodeURIComponent(JSON.stringify(list))}`
      })
    } else {
      //请升级到最新的微信版本
      yield showModal({
        title: '微信版本过低',
        content: '请升级到最新的微信版本',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
    }
  }),

  invoice: co.wrap(function* () {
    mta.Event.stat('fapiaodayin', {
      'media': 'card'
    })
    if (this.checkBaseVersion('2.3.0')) {
      yield this.forceAuth()
    } else {
      yield showModal({
        title: '提示',
        content: '请升级微信至最新版本',
        showCancel: false,
        confirmColor: '#6BA1F6'
      })
      return
    }

  }),

  forceAuth: co.wrap(function* () {
    let _this = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.invoice']) {
          wx.authorize({
            scope: 'scope.invoice',
            success() {
              _this.scopeInvoice()
            },
            fail() {
              wx.showModal({
                title: '您暂未同意授权',
                content: '请开启微信卡包的授权，才能使用发票打印',
                showCancel: true,
                confirmColor: '#fae100',
                success: function () {
                  wx.openSetting({
                    success: (res) => {
                      if (res.authSetting['scope.invoice']) {
                        // 设置了权限
                        _this.scopeInvoice()
                      } else {
                        _this.forceAuth()
                      }
                    },
                    fail: function () {
                      _this.forceAuth()
                    }
                  })
                },
                fail: function () {
                  router.navigateBack(5)
                },
              })
            }
          })
        } else {
          _this.scopeInvoice()
        }
      }
    })
  }),

  onShareAppMessage: function () {
    return app.share
  }
})