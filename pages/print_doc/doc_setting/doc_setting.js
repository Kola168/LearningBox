const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const _ = require('../../../lib/underscore/we-underscore')
const showModal = util.promisify(wx.showModal)
import commonRequest from '../../../utils/common_request.js'
import { getLogger } from '../../../utils/logger'
const logger = new getLogger('pages/print_doc/doc_setting/doc_setting')
import router from '../../../utils/nav'
import event from '../../../lib/event/event'
Page({

  data: {
    fileTitle: null,
    documentPrintNum: 1,
    startPrintPage: 1,
    endPrintPage: 1,
    colorCheck: 'Color', //默认彩色
    duplexCheck: false,
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
    rangeList: [
      {
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
    }],
    isFullScreen: false
  },

  onLoad: co.wrap(function*(options) {
    this.longToast = new app.weToast()
    try {
      let query = JSON.parse(decodeURIComponent(options.postData))

      this.query = query
      let tempData = {
        fileTitle: util.resetFiles(query.name),
        fileIndex: query.fileIndex,
        colorModes: query.colorModes,
        media_sizes: query.media_sizes,
        duplexCheck: query.duplexcheck,
        previewUrl: query.url,
        endMaxPage: query.page_count,
        totalPage: query.page_count,
      }
      if (query.isSetting) {
        tempData.startPrintPage = query.start_page
        tempData.endPrintPage = query.end_page
        tempData.startPage = query.start_page
        tempData.endPage = query.end_page
        tempData.zoomType = query.display
        tempData.documentPrintNum = query.number
        tempData.checkOpen = !query.skip_gs
        tempData.extract = query.extract
        if (query.extract !== 'all') {
          tempData.startPrintPage = 1
          tempData.endPrintPage = query.page_count
          tempData.startPage = 1
          tempData.endPage = query.page_count
        }
      } else {
        tempData.startPrintPage = 1
        tempData.endPrintPage = query.page_count
        tempData.startPage = 1
        tempData.endPage = query.page_count
        tempData.extract = 'all'
      }

      this.setData({
        ...tempData,
        isFullScreen: app.isFullScreen
      })
    } catch (e) {
      logger.info(e)
      util.showError(e)
    }
    if (parseInt(this.query.page_count) > 150) {
      yield showModal({
        title: '提示',
        content: '此文档的打印页数超过150张',
        showCancel: false,
        confirmColor: '#fae100',
      })
    }
    yield this.setStatus()
  }),

  /**
   * @methods 设置默认选项值
   */
  setStatus: co.wrap(function*() {
      //设置是否支持多面打印
    if (this.query.media_sizes[0].duplex) {
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

  /**
   * @methods 减少份数
   */
  cutPrintNum: function() {
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
  addPrintNum: co.wrap(function*() {
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
  inputStartPage: function(e) {
    this.data.startPage = e.detail.value
  },

  /**
   * @methods 设置起始页
   * @param {Object} e 
   */
  startPageJudge: function(e) {
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
      this.data.startPrintPage = e.detail.value
    }
  },

  /**
   * @methods 输入打印结束页
   * @param {Object} e 
   */
  inputEndPage(e) {
    this.data.endPage = e.detail.value
  },

  /**
   * @methods 设置录入的结束页
   * @param {Object} e 
   */
  endPageJudge(e) {
    let endMaxPage = Math.ceil(this.data.endMaxPage / this.data.zoomType),
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
      this.data.endPrintPage = e.detail.value
    }
  },

  /**
   * @methods 选择颜色
   * @param {Object} e 
   */
  colorCheck(e) {
    this.setData({
      colorCheck: e.currentTarget.dataset.style
    })
  },

  /**
   * @methods 选择单双面打印模式
   * @param {Object} e 
   */
  duplexCheck(e) {
    console.log(e)
    let duplexCheck = e.currentTarget.dataset.style == '0' ? false : true
    this.setData({
      duplexCheck: duplexCheck
    })
  },

  /**
   * @methods 确认按钮提交
   */
  confCheck() {
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

    let postData = {
      color: this.data.colorCheck,
      duplex: this.data.duplexCheck,
      number: this.data.documentPrintNum,
      medium: this.data.medium,
      fileIndex: this.data.fileIndex,
      display: this.data.zoomType,
      skip_gs: !this.data.checkOpen,
      extract: this.data.extract,
      start_page: this.data.startPage,
      end_page: this.data.endPage
    }
    if (this.data.extract !== 'all') {
      postData.start_page = 0
      postData.end_page = 0
    }
    event.emit('setPreData', postData)
    router.navigateBack()
  },

  /**
   * @methods 选择缩印模式
   * @param {Object} e 
   */
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

  preview: co.wrap(function*() {
    let url = this.data.previewUrl
    let  display = this.data.zoomType
    let skip_gs = !this.data.checkOpen
    let extract = this.data.extract || 'all'
    this.longToast.toast({
      type:'loading',
      title: '正在开启预览',
      duration: 0
    })
    commonRequest.previewDocument({
      feature_key: 'doc_a4',
      worker_data: {url, display, skip_gs, extract}
    }, ()=>{
      this.longToast.hide()
    })
  }),

  operaRepair: function() {
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

  openRepair: co.wrap(function*() {
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