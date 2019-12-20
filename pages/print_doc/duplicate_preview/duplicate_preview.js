// pages/print_doc/duplicate_preview/duplicate_preview.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const _ = require('../../../lib/underscore/we-underscore')
import commonRequest from '../../../utils/common_request'
import {
  getLogger
} from '../../../utils/logger'
const logger = new getLogger('pages/print_doc/duplicate_preview/duplicate_preview')
import router from '../../../utils/nav'
import storage from '../../../utils/storage'

Page({
  data: {
    width: 0,
    height: 0,
    count: 1,
    preUrl: '',
    no_select_icon: '/images/radio_off.png',
    select_icon: '/images/radio_on.png',
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
    isFullScreen: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    }
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.initArea()
    this.setData({
      isFullScreen: app.isFullScreen,
      preUrl: decodeURIComponent(options.preUrl),
      img_url: decodeURIComponent(options.url)
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
  backPrePage() {
    router.navigateBack()
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

  /**
   * @methods 提交前确认打印
   */
  confirm() {

    var hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.print()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  },
  
  /**
   * @methods 提交打印照片
   */
  print: co.wrap(function* () {
    if (!this.id) {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后'
      })
      try {
        var param = [{
          copies: this.data.count, //数量
          printUrl: this.data.img_url, //图片编辑后url
          originalUrl: this.data.preUrl, //图片原始url
          grayscale: this.data.color == 'Mono' ? true : false, //色彩
        }]
        const resp = yield commonRequest.createOrder('reprography', param)
        this.longToast.toast()
        router.redirectTo('/pages/finish/index', {
          media_type: 'reprography',
          state: resp.createOrder.state
        })

      } catch (e) {
        logger.info(e)
        this.longToast.toast()
        util.showError(e)
      }
    }
  }),

  onShareAppMessage() {
    return app.share
  }
})
