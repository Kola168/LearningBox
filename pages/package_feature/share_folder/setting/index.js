const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
import {
  co,
  util
} from '../../../../utils/common_import'
const _ = require('../../../../lib/underscore/we-underscore')
const showModal = util.promisify(wx.showModal)
import commonRequest from '../../../../utils/common_request'
import api from '../../../../network/restful_request.js'
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

Page({

  data: {
    share: app.galleryShare,
    documentTitle: '',
    documentPrintNum: 1,
    startPrintPage: 1,
    endPrintPage: 1,
    colorcheck: 'Color', //默认彩色
    duplexcheck: false,
    previewUrl: '',
    endMaxPage: 1, //最大页数
    totalPage: 1,
    showSelect: false,
    medium: 'a4',
    defaultMedium: 'A4打印纸',
    optionsMedium: 'A5打印纸',
    fileIndex: 0,
    isExcel: true,
    colorModes: 2,
    isColorPrinter: true,
    isDuplex: true,
    startPage: 1,
    endPage: 1,
    zoomType: 1,
    showConfirm: false,
    checkOpen: false,
    extract: 'all',
    fileTitle: null,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    }
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    try {
      const MAX_PAGE = 150;
      const arrayFile = this.data.arrayFile = JSON.parse(decodeURIComponent(options.files))
      let print_capability = yield commonRequest.getPrinterCapacity('doc_a4')
      if (!print_capability) {
        return
      }
      const page_count = print_capability.page_count;
      this.setData({
        isExcel: this.isExcelFiles(arrayFile.name),
        origin_name: arrayFile.name,
        previewUrl: arrayFile.url,
        fileTitle: util.resetFiles(arrayFile.name),
        endPrintPage: page_count,
        endPage: page_count,
        endMaxPage: page_count,
        totalPage: page_count,
        name: arrayFile.name,
        mediumCount: print_capability.media_sizes.length, //打印介质的数量
        colorModes: print_capability.color_modes,
        media_sizes: print_capability.media_sizes,
        startPage: 1,
        startPrintPage: 1,
        documentPrintNum: arrayFile.number || 1
      })
      if (parseInt(page_count) > MAX_PAGE) {
        yield showModal({
          title: '提示',
          content: '此文档的打印页数超过150张',
          showCancel: false,
          confirmColor: '#fae100',
        })
      }
      yield this.setStatus();

    } catch (e) {
      logger.info(e)
    }

  }),

  isExcelFiles(name = '') {
    const rgx = "(.xlsx|.xls|.xlsm|.xltx|.xltm)$";
    const reg = new RegExp(rgx);
    return reg.test(name);

  },
  setStatus: co.wrap(function* () {
    //设置是否支持多面打印
    if (this.data.media_sizes[0].duplex) {
      this.setData({
        isDuplex: true
      })
    } else {
      this.setData({
        isDuplex: false
      })
    }

    //黑白彩色模式
    if (this.data.colorModes.length == 1) {
      this.setData({
        isColorPrinter: false
      })
    } else {
      this.setData({
        isColorPrinter: true
      })
    }
  }),

  //减少份数
  cutPrintNum: function () {
    if (this.data.documentPrintNum <= 1) {
      return wx.showModal({
        content: '最少要1份才可以打印哦~',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
    }
    this.setData({
      documentPrintNum: --this.data.documentPrintNum
    })
  },

  //增加份数
  addPrintNum() {
    this.data.documentPrintNum += 1;
    if (this.data.documentPrintNum <= 50) {
      this.setData({
        documentPrintNum: this.data.documentPrintNum
      })
    } else {
      this.setData({
        documentPrintNum: 50
      })
      wx.showModal({
        content: '每次最多打印50份',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
    }

  },

  //输入打印起始页
  inputstartpage(e) {
    this.data.startPage = Number(e.detail.value)
  },

  startpagejudge: function (e) {
    logger.info('起始页===', parseInt(e.detail.value), typeof (e.detail.value))
    if (parseInt(e.detail.value) > parseInt(this.data.endPrintPage) || parseInt(e.detail.value) <= 0) {
      this.setData({
        startPrintPage: 1,
        startPage: 1
      })
      wx.showModal({
        content: '请输入正确的起始页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
      return
    } else {
      logger.info('打印起始页===', e.detail.value)
      this.data.startPrintPage = Number(e.detail.value)
    }
  },
  //输入打印结束页
  inputendpage(e) {
    this.data.endPage = Number(e.detail.value)
  },
  endpagejudge(e) {
    let endMaxPage = Math.ceil(this.data.endMaxPage / this.data.zoomType),
      tempValue = parseInt(e.detail.value)
    if (tempValue < parseInt(this.data.startPrintPage) || tempValue > endMaxPage) {
      logger.info('结束页===', parseInt(e.detail.value), typeof (e.detail.value))
      this.setData({
        endPrintPage: this.data.endMaxPage,
        endPage: this.data.endMaxPage
      })
      wx.showModal({
        content: '请输入正确的结束页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
      return
    } else {
      logger.info('打印完成页===', e.detail.value)
      this.data.endPrintPage = Number(e.detail.value)
    }
  },

  //选择颜色
  colorCheck(e) {
    this.setData({
      colorcheck: e.currentTarget.dataset.style
    })
  },

  //选择单双面打印模式
  duplexCheck(e) {
    logger.info(e)
    let duplexcheck = e.currentTarget.dataset.style == 0 ? false : true
    this.setData({
      duplexcheck: duplexcheck
    })
  },

  //确认按钮提交
  confcheck(e) {
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

    let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.print()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  },


  print: co.wrap(function* () {
    try {
      let extract = this.data.extract
      let tempObj = {
        printUrl:this.data.arrayFile.url,
        originalUrl: this.data.arrayFile.url,
        filename: this.data.arrayFile.name,
        copies: this.data.documentPrintNum, // 张数
        startPage: this.data.startPage, // 起始页数
        endPage: this.data.endPage, // 终止页数
        display: this.data.zoomType,
        skipGs: !this.data.checkOpen, //是否检查文件修复
        color: this.data.colorcheck=='Color'?true:false, // 是否是彩色
        grayscale: false,
        duplex: this.data.duplexcheck ? true : false, // false单面 true双面
        media_size: (this.data.medium === 'a4') ? 0 : 3, //纸质
        extract: extract //范围类型
      }
      if (extract !== 'all') {
        tempObj.startPage = 0
        tempObj.endPage = 0
      }
      let files = [tempObj];

      this.longToast.toast({
        type: 'loading',
        duration: 0
      })
      const resp = yield commonRequest.createOrder('doc_a4', files)
      router.navigateTo('/pages/finish/index', {
        type: shareFile,
        state: resp.createOrder.state
      })
      this.longToast.hide()
    } catch (e) {
      logger.info(e)
      this.longToast.hide()
      util.showError(e)
    }
  }),
  // 选择缩印模式
  chooseZoomType(e) {
    let zoomType = Number(e.currentTarget.id)
    let endPage = Math.ceil(this.data.endMaxPage / zoomType)
    this.setData({
      zoomType: zoomType,
      endPrintPage: endPage,
      endPage: endPage,
      totalPage: endPage
    })
  },
  preview() {
    let url = this.data.previewUrl,
      display = this.data.zoomType,
      skip_gs = !this.data.checkOpen,
      extract = this.data.extract
    commonRequest.previewDocument(url, display, skip_gs, extract)
  },
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
  // 选择打印范围类型奇、偶、范围
  chooseRangeType(e) {
    let type = e.currentTarget.id,
      endMaxPage = this.data.endMaxPage,
      endPage = endMaxPage,
      zoomType = this.data.zoomType
    if (type !== 'all') {
      zoomType = 1
      if (type === 'odd') {
        endPage = Math.ceil(endMaxPage / 2)
      } else if (type === 'even') {
        endPage = Math.floor(endMaxPage / 2)
      }
    }
    this.setData({
      zoomType: zoomType,
      extract: type,
      endPrintPage: endPage,
      endPage: endPage,
      totalPage: endPage
    })
  },
})