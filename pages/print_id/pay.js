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
    this.userSn = storage.get('userSn')
    if (!this.userSn) {
      return router.navigateTo('/pages/authorize/index')
    }
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
    
    this.setData({

      // price_count: this.query.price,
      // price: this.query.price,
      // can_free_print: this.query.can_free_print ? this.query.can_free_print : false
    })
  }),
  pay: co.wrap(function () {
    if (this.data.type == 'paper') {
      this.toPrint()
    } else {
      this.toSave()
    }
  }),
  toPrint() {
    wxNav.navigateTo('/pages/print_id/print', {
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
    wxNav.navigateTo('/pages/print_id/smart_save', {
      confirm: JSON.stringify(this.query),
      info: JSON.stringify(this.info),
      url: JSON.stringify(this.data.url),
    })
  }
})