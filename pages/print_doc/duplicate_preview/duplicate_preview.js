// pages/print_doc/duplicate_preview/duplicate_preview.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const _ = require('../../../lib/underscore/we-underscore')
const request = util.promisify(wx.request)
import {
  getLogger
} from '../../../utils/logger'
const logger = new getLogger('pages/print_doc/doc_list/doc_list')
import router from '../../../utils/nav'
import storage from '../../../utils/storage'

Page({
  data: {
    width: 0,
    height: 0,
    count: 1,
    preUrl: '',
    no_select_icon: '/images/doc_noselected.png',
    select_icon: '/images/doc_document_checked.png',
    color: 'Mono', //是否彩色
    colorList: [{
        name: '黑白',
        key: 'Mono',
        is_select: true
      },
      {
        name: '全彩',
        key: 'Color',
        is_select: false
      }
    ],
    img_url: null,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    }
  },
  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.initArea()
    this.setData({
      preUrl: decodeURIComponent(options.preUrl),
      img_url: decodeURIComponent(options.url)
    })
  },

  onShow: function () {
    let hasAuthPhoneNum = Boolean(storage.get("hasAuthPhoneNum"))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },

  initArea() {
    let deviceWidth = app.sysInfo.screenWidth
    let deviceHeight = app.sysInfo.screenHeight
    let width = deviceWidth - 30
    let height = width * 3564 / 2520

    if (height > deviceHeight - 340) {
      height = deviceHeight - 340
      width = height * 2520 / 3564
    }
    this.setData({
      height,
      width
    })
  },

  /**
   * @methods 返回上一页
   */
  backPrepage() {
    router.navigateTo()
  },

  /**
   * @methods 减少打印数量
   */
  reduce() {
    this.data.count > 1 && this.setData({
      count: this.data.count - 1
    })
  },

  /**
   * @methods 增加打印数量
   */
  add() {
    this.setData({
      count: this.data.count + 1
    })
  },

  /**
   * @methods 选择色彩
   * @param {*} e dom
   */
  chooseColor({
    currentTarget: {
      dataset: {
        index
      }
    }
  }) {
    const colorList = this.data.colorList;
    for (let i = 0, len = colorList.length; i < len; i++) {
      colorList[i].is_select = (i == index) ? true : false;
    }
    this.setData({
      colorList: colorList,
      color: colorList[index].key
    })
  },

  // 提交前确认打印
  confirm() {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }
    var hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
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
    storage.set("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.confirm()
  }),

  //提交打印照片
  print: co.wrap(function* () {
    if (!this.id) {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后'
      })
      try {
        let param = {
          media_type: 'copy',
          openid: app.openId,
          urls: [{
            number: this.data.count, //数量
            pre_convert_url: this.data.img_url, //图片原始url
            url: this.data.img_url, //图片原始url
            rotate: false,
            thumb_url: this.data.preUrl, //图片url
            color: this.data.color, //色彩
          }]
        }
        const resp = yield request({
          url: app.apiServer + `/ec/v2/orders`,
          method: 'POST',
          dataType: 'json',
          data: param
        })

        if (resp.data.code != 0) {
          throw (resp.data)
        } else {
          router.redirectTo('')
          // wx.redirectTo({
          //   url: `/pages/finish/index?type=id_card&media_type=invoice&state=${resp.data.order.state}`
          // })
        }
      } catch (e) {
        logger.info(e)
        this.longToast.toast()
        util.showErr(e)
      }
    }
  }),
  onShareAppMessage() {
    return app.share
  }
})