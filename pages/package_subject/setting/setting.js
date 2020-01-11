const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../utils/common_import'
const _ = require('../../../lib/underscore/we-underscore')
const showModal = util.promisify(wx.showModal)
import graphql from '../../../network/graphql/subject'
import commonRequest from '../../../utils/common_request'
import {
  getLogger
} from '../../../utils/logger'
const logger = new getLogger('pages/package_subject/setting/setting')
Page({

  data: {
    fileTitle: null,
    documentPrintNum: 1,
    startPrintPage: 1,
    endPrintPage: 1,
    colorCheck: true, //默认彩色
    duplexCheck: false,
    previewUrl: '',
    endMaxPage: 1, //最大页数
    totalPage: 1,
    showSelect: false,
    // medium: 'a4',
    defaultMedium: 'A4打印纸',
    optionsMedium: 'A5打印纸',
    isExcel: true,
    color: false,
    isColorPrinter: true,
    isDuplex: true,
    startPage: 1,
    endPage: 1,
    singlePageLayoutsCount: 1,
    showConfirm: false,
    checkOpen: false,
    extract: 'all',
    rangeList: [{
        name: '打印范围',
        _id: 'all'
      },
      {
        name: '仅打印奇数页',
        _id: 'odd'
      },
      {
        name: '仅打印偶数页',
        _id: 'even'
      }
    ],
    isFullScreen: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    }
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    try {
      var query = this.query = JSON.parse(decodeURIComponent(options.postData))

      var printCapability = yield commonRequest.getPrinterCapacity(query.featureKey)
      if (!printCapability) {
        return
      }

      let tempData = {
        fileTitle: query.name,
        color: printCapability.color,
        grayscale: printCapability.grayscale,
        duplex: printCapability.duplex,
        colorCheck: printCapability.color,
        duplexCheck: printCapability.duplex,
        endMaxPage: query.pageCount,
        totalPage: query.pageCount,
        sn: query.sn,
        pageCount: query.pageCount,
        originalUrl: query.originalUrl,
        startPrintPage: 1,
        endPrintPage: query.pageCount,
        startPage: 1,
        endPage: query.pageCount,
      }

      this.setData({
        ...tempData,
        isFullScreen: app.isFullScreen
      })
    } catch (e) {
      logger.info(e)
      util.showError(e)
    }
    yield this.setStatus(printCapability)
  }),

  /**
   * @methods 设置默认选项值
   */
  setStatus: co.wrap(function* (printCapability) {
    //设置是否支持多面打印
    if (printCapability.duplex) {
      this.setData({
        isDuplex: true
      })
    } else {
      this.setData({
        isDuplex: false
      })
    }
    //黑白彩色模式
    if (printCapability.color && printCapability.grayscale) {

      this.setData({
        isColorPrinter: true
      })
    } else {
      this.setData({
        isColorPrinter: false
      })
    }
  }),

  /**
   * @methods 减少份数
   */
  cutPrintNum: function () {
    if (this.data.documentPrintNum <= 1) {
      return
    }
    this.data.documentPrintNum -= 1
    this.setData({
      documentPrintNum: this.data.documentPrintNum
    })
  },

  /**
   * @methods 增加份数
   */
  addPrintNum: co.wrap(function* () {
    if (this.data.documentPrintNum < 30) {
      this.data.documentPrintNum += 1
      this.setData({
        documentPrintNum: this.data.documentPrintNum
      })
    } else {
      yield showModal({
        content: '每次最多打印30份',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
    }

  }),

  /**
   * @methods 输入打印起始页
   * @param {Object} e 
   */
  inputStartPage: function (e) {
    this.data.startPage = Number(e.detail.value)
  },

  /**
   * @methods 设置起始页
   * @param {Object} e 
   */
  startPageJudge: function (e) {
    if (parseInt(e.detail.value) > parseInt(this.data.endPrintPage) || parseInt(e.detail.value) <= 0) {
      this.setData({
        startPrintPage: 1,
        startPage: 1
      })
      return wx.showModal({
        content: '请输入正确的起始页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })

    } else {
      this.data.startPrintPage = Number(e.detail.value)
    }
  },

  /**
   * @methods 输入打印结束页
   * @param {Object} e 
   */
  inputEndPage(e) {
    this.data.endPage = Number(e.detail.value)
  },

  /**
   * @methods 设置录入的结束页
   * @param {Object} e 
   */
  endPageJudge(e) {
    let endMaxPage = Math.ceil(this.data.endMaxPage / this.data.singlePageLayoutsCount),
      tempValue = parseInt(e.detail.value)
    if (tempValue < parseInt(this.data.startPrintPage) || tempValue > endMaxPage) {
      this.setData({
        endPrintPage: this.data.endMaxPage,
        endPage: this.data.endMaxPage
      })
      return wx.showModal({
        content: '请输入正确的结束页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })

    } else {
      this.data.endPrintPage = Number(e.detail.value)
    }
  },

  /**
   * @methods 选择颜色
   * @param {Object} e 
   */
  colorCheck(e) {
    this.setData({
      colorCheck: Boolean(Number(e.currentTarget.dataset.style))
    })
  },

  /**
   * @methods 选择单双面打印模式
   * @param {Object} e 
   */
  duplexCheck(e) {
    let duplexCheck = e.currentTarget.dataset.style == '0' ? false : true
    this.setData({
      duplexCheck: duplexCheck
    })
  },

  /**
   * @methods 确认按钮提交
   */
  confCheck: co.wrap(function* () {
    if (parseInt(this.data.startPage) > parseInt(this.data.endPage) || parseInt(this.data.startPage) <= 0) {
      this.setData({
        startPrintPage: 1,
        startPage: 1
      })
      return wx.showModal({
        content: '请输入正确的起始页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })

    }

    if (parseInt(this.data.endPage) < parseInt(this.data.startPage) || parseInt(this.data.endPage) > parseInt(this.data.totalPage)) {
      this.setData({
        endPrintPage: this.data.endMaxPage,
        endPage: this.data.endMaxPage
      })
      return wx.showModal({
        content: '请输入正确的结束页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })

    }
    this.confirm()
  }),

  /**
   * @methods 选择缩印模式
   * @param {Object} e 
   */
  chooseZoomType(e) {
    let singlePageLayoutsCount = Number(e.currentTarget.id)
    let endPage = Math.ceil(this.data.endMaxPage / singlePageLayoutsCount)
    this.setData({
      singlePageLayoutsCount: singlePageLayoutsCount,
      endPrintPage: endPage,
      endPage: endPage,
      totalPage: endPage
    })
  },

  // preview: co.wrap(function*() {
  //   let url = this.data.previewUrl
  //   let  display = this.data.singlePageLayoutsCount
  //   let skip_gs = !this.data.checkOpen
  //   let extract = this.data.extract || 'all'
  //   this.longToast.toast({
  //     type:'loading',
  //     title: '正在开启预览',
  //     duration: 0
  //   })
  //   commonRequest.previewDocument({
  //     feature_key: 'doc_a4',
  //     worker_data: {url, display, skip_gs, extract}
  //   }, ()=>{
  //     this.longToast.hide()
  //   })
  // }),

  operaRepair: function () {
    this.setData({
      checkOpen: !this.data.checkOpen,
      showConfirm: this.data.checkOpen ? false : true,
    })
  },

  cancelRepair() {
    this.setData({
      checkOpen: false,
      showConfirm: false,
    })
  },

  openRepair: co.wrap(function* () {
    this.setData({
      showConfirm: false
    })
  }),

  /**
   * @methods 选择打印范围类型奇、偶、范围
   * @param {Object} e 
   */
  chooseRangeType(e) {
    let type = e.currentTarget.id,
      endMaxPage = this.data.endMaxPage,
      endPage = endMaxPage,
      singlePageLayoutsCount = this.data.singlePageLayoutsCount
    if (type !== 'all') {
      singlePageLayoutsCount = 1
      if (type === 'odd') {
        endPage = Math.ceil(endMaxPage / 2)
      } else if (type === 'even') {
        endPage = Math.floor(endMaxPage / 2)
      }
    }
    this.setData({
      singlePageLayoutsCount: singlePageLayoutsCount,
      extract: type,
      endPrintPage: endPage,
      endPage: endPage,
      totalPage: endPage
    })
  },

  confirm: co.wrap(function* () {
    let hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.print()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  }),

  print: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.createXuekewangOrder({
        attributes: {
          resourceType: 'XuekewangExercise',
          sn: this.data.sn,
          originalUrl: this.data.originalUrl,
          copies: this.data.documentPrintNum,
          grayscale: !this.data.colorCheck,
          color: this.data.colorCheck,
          startPage: 1,
          endPage: this.data.endPage,
          duplex: this.data.duplexCheck,
          // skipGs: this.data.checkOpen,
          // extract: this.data.extract,
          // singlePageLayoutsCount: this.data.singlePageLayoutsCount,
        },
        featureKey: this.query.featureKey
      })
      this.longToast.hide()
      wxNav.navigateTo('/pages/finish/index', {
        media_type: this.query.featureKey,
        state: resp.createXuekewangOrder.state
      })
    } catch (err) {
      this.longToast.hide()
      util.showError(err)
    }
  })

})