// pages/print_wx/setting.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const request = util.promisify(wx.request)
import storage from '../../../utils/storage'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/print_doc/print_wx_setting/print_wx_setting')
Page({
  data: {
    img1: '/images/doc_noselected.png',
    img2: '/images/doc_document_checked.png',
    img3: '/images/doc_document_checked.png',
    img4: '/images/doc_noselected.png',
    isColor: true,
    color: 'Color',
    link: '',
    converted_url: '',
    start_page: '',
    end_page: '',
    page_count: '',
    duplex: false,
    isDuplex: false,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    }
  },
  
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    this.setData({
      link: options.link ? JSON.parse(decodeURIComponent(options.link)) : '',
      converted_url: JSON.parse(decodeURIComponent(options.converted_url))
    })
    this.pages = options.pages
    this.from = options.from
    yield this.setting()
  }),
  
  onShow: function () {
    var hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },

  setting: co.wrap(function* (e) {
    //获取打印能力
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      var resp = yield request({
        url: app.apiServer + `/ec/v2/apps/printer_capability`,
        method: 'GET',
        dataType: 'json',
        data: {
          openid: app.openId,
          url: this.data.converted_url
        }
      })
      if (resp.data.code == 1001) {
        this.longToast.hide()
        this.setData({
          start_page: 1,
          end_page: this.pages,
          page_count: this.pages
        })
        return this.setData({
          isColor: false,
          img1: '/images/doc_document_checked.png',
        })
      } else if (resp.data.code != 0) {
        throw (resp.data)
      }
      this.longToast.hide()
      let color_length = resp.data.print_capability.color_modes.length
      if (color_length == 1) {
        this.setData({
          isColor: false,
          img1: '/images/doc_document_checked.png',
        })
      }
      let page_count = resp.data.print_capability.page_count
      let duplex = resp.data.print_capability.media_sizes[0].duplex
      this.setData({
        start_page: 1,
        end_page: page_count,
        page_count: page_count,
        isDuplex: duplex
      })

    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  chooseColor1 (e) {
    this.setData({
      img1: '/images/doc_document_checked.png',
      img2: '/images/doc_noselected.png',
      color: 'Mono'
    })
  },

  chooseColor2 (e) {
    this.setData({
      img1: '/images/doc_document_checked.png',
      img2: '/images/doc_document_checked.png',
      color: 'Color'
    })
  },

  chooseColor3 (e) {
    this.setData({
      img3: '/images/doc_document_checked.png',
      img4: '/images/doc_noselected.png',
      duplex: false
    })
  },

  chooseColor4 (e) {
    this.setData({
      img3: '/images/doc_noselected.png',
      img4: '/images/doc_document_checked.png',
      duplex: true
    })
  },

  start ({detail:{value} }) {
    this.setData({
      start_page: value
    })
  },

  end ({detail: {value}}) {
    this.setData({
      end_page: value
    })
  },

  preview (e) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候',
      duration: 0
    })
    let _this = this
    wx.downloadFile({
      url: _this.data.converted_url,
      success(res) {
        if (res.statusCode === 200) {
          _this.longToast.toast()
          wx.openDocument({
            filePath: res.tempFilePath,
            success(res) {
              logger.info('打开文档成功')
            }
          })
        }
      }
    })
  },

  confirm (e) {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }

    let num1 = parseInt(this.data.start_page)
    let num2 = parseInt(this.data.end_page)
    if (num1 > num2 || num1 > parseInt(this.data.page_count)) {
      return util.showErr({
        message: '您输入的页数有误'
      })
    }
    if (num1 == 0 || num2 == 0) {
      return util.showErr({
        message: '输入页数不能为0'
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

  getPhoneNumber: co.wrap(function* (e) {
    yield app.getPhoneNum(e)
    storage.put('hasAuthPhoneNum', true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.confirm(e)
  }),

  print: co.wrap(function* (e) {
    this.longToast.toast({
      type: 'loading',
      title: '正在提交'
    })
    let params = {
      openid: app.openId,
      urls: [{
        url: this.data.converted_url,
        color: this.data.color,
        number: 1,
        start_page: this.data.start_page,
        end_page: this.data.end_page,
        duplex: this.data.duplex
      }],
      media_type: "page2doc",
    }
    try {
      const resp = yield request({
        url: app.apiServer + `/ec/v2/orders`,
        method: 'POST',
        dataType: 'json',
        data: params
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      } else {
        this.longToast.hide()
        router.redirectTo('../finish/index', {
          type: 'wx',
          media_type: 'page2doc',
          state: resp.data.order.state
        })
        // wx.redirectTo({
        //   url: `../finish/index?type=wx&media_type="page2doc"&state=${resp.data.order.state}`
        // })
      }
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  })
})