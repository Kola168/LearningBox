const app = getApp()
const _ = require('../../../lib/underscore/we-underscore')
import commonRequest from '../../../utils/common_request'
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage,
} from '../../../utils/common_import'
import {
  getLogger
} from '../../../utils/logger'
const showModal = util.promisify(wx.showModal)
const logger = new getLogger('pages/package_common/setting/setting')
import event from '../../../lib/event/event'
import printConfig from './print'
Page({

  data: {
    fileTitle: null,
    copies: 1, //打印分数
    startPrintPage: 1, // 起始页
    endPrintPage: 1, //结束页
    color: true, //默认彩色
    grayscale: false, //默认不是黑色
    duplex: false, //默认单面
    previewUrl: '',
    endMaxPage: 1, //最大页数
    totalPage: 1, //总页面
    fileIndex: 0,
    color: false, //色彩选项  
    isColorPrinter: true, //是否支持黑白（灰度）彩色 设置
    isDuplex: true, //是否支持单双面
    startPage: 1,
    endPage: 1,
    singlePageLayoutsCount: 1, //缩印方式
    skipGs: false, //是否开启强制转换
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
    showConfirm: false,
    isFullScreen: false,
    confirmModal: {
			isShow: false,
			title: '请正确放置A4打印纸',
			image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
		},
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    try {
      // var options = {
      //   settingData: encodeURIComponent(JSON.stringify({
      //     isPreview: true, //是否预览文档
      //     file: {
      //        name: '???' 设置文件名称
      //     },
      //     btn: {   //底部按钮
      //       isBack: true, 
      //       btnContent: '确认设置',
            
      //     },
      //     orderPms: { // 订单参数
      //       pageCount: 20,
      //       printType: 'subject',
      //       attributes || resourceAttribute: { // 订单提交参数
      //         resourceType: 'XuekewangExercise',
      //         sn: '789560367499',
      //         isAnswer: true,
      //       },
      //       featureKey: 'xuekewang_exercise' 
      //     },
      //     checkCapabilitys: { // 支持设置状态参数
              // isSettingDuplex: false, //是否设置单双面
              // isSettingColor: false, //是否设置色彩
              // isSettingOddEven: false, //是否设置奇偶
              // isSettingSkipGs: false, //是否支持文件修复
              // isSinglePageLayout: false //是否支持缩放
      //     }
      //   }))
      // }
      var baseSettings = yield this.initSettings(options)
      console.log(baseSettings, '==baseSettings==')
      this.setData({
        setting: {
          ...baseSettings,
        },
        isFullScreen: app.isFullScreen
      })
    } catch (e) {
      logger.info(e)
      util.showError(e)
    }

    // 配置max_count 
    if (parseInt(this.settingData.orderPms.pageCount) > 150) {
      yield showModal({
        title: '提示',
        content: '此文档的打印页数超过150张',
        showCancel: false,
        confirmColor: '#fae100',
      })
    }
    yield this.setExtendSettings() //设置是否支持扩展属性状态
    yield this.setBaseData()

  }),

  initSettings: co.wrap(function *(options) {
    /**
     * 设置页区分
     * 1 类根据 打印类型  进行订单区分 创建 {内容}和 {文档} 订单
     * 2 类 根据操作类型  2.1 是否保存设置项返回上一页 2.2 本页进行设置直接打印
     * 
     */

    try {
      var settingData = this.settingData = JSON.parse(decodeURIComponent(options.settingData))
      yield this.getPrinterCapability(settingData)
      var baseSettings = {
        isPreview: settingData.isPreview || false,
        name: settingData.file.name,
        btn: {
          isBack: settingData.btn && settingData.btn.isBack || false, //判断设置页是否需要返回保存setting
          btnContent: settingData.btn && settingData.btn.btnContent || settingData.btn && settingData.btn.isBack ? '确认设置' : '确认打印' //打印按钮文案
        },
        orderPms: {
          ...settingData.orderPms,
          pageCount: settingData.orderPms.pageCount || this.data.printterCapacity.pageCount,
          printType: settingData.orderPms.printType, //打印类型
          featureKey: settingData.orderPms.featureKey, //打印标示key
        },
        checkCapabilitys: {
          isSettingDuplex: settingData.checkCapabilitys.isSettingDuplex, //是否设置单双面
          isSettingColor: settingData.checkCapabilitys.isSettingColor, //是否设置色彩
          isSettingOddEven: settingData.checkCapabilitys.isSettingOddEven, //是否设置奇偶
          isSettingSkipGs: settingData.checkCapabilitys.isSettingSkipGs, //是否支持文件修复
          isSinglePageLayout: settingData.checkCapabilitys.isSinglePageLayout, //是否支持缩放
        },
      }

      return baseSettings
      
    } catch(err) {
      logger.info(err)
    }
  }),

  /**
   * 设置基本参数
   */
  setBaseData: co.wrap(function *() {
    var printterCapacity = this.data.setting.orderPms
    var pageCount = this.settingData.orderPms.pageCount || this.data.printterCapacity.pageCount
    var postData = {
      color: printterCapacity.color || this.data.color,
      grayscale: printterCapacity.grayscale || this.data.color ? false : this.data.grayscale,
      duplex: printterCapacity.duplex || this.data.duplex,
      copies: printterCapacity.copies || this.data.copies,
      singlePageLayoutsCount: printterCapacity.singlePageLayoutsCount || this.data.singlePageLayoutsCount,
      skipGs: printterCapacity.skipGs || this.data.skipGs,
      extract: printterCapacity.extract || this.data.extract,
      startPage: printterCapacity.startPage || this.data.startPage,
      endPage: printterCapacity.endPage || pageCount,
      startPrintPage:  printterCapacity.startPage || this.data.startPage,
      endPrintPage: printterCapacity.endPage || pageCount,
      endMaxPage: this.data.setting.orderPms.pageCount, //最大页数
      totalPage: this.data.setting.orderPms.pageCount, //总页数
    }
    this.setData(postData)
  }),

  /**
   * @methods 获取打印能力
   */
  getPrinterCapability: co.wrap(function* (setBaseData) {
    try {
      if (!setBaseData)return
      var printterCapacity = yield printConfig.getPrinterCapability(setBaseData.orderPms) //获取打印能力数据
      this.setData({
        printterCapacity
      })
    } catch (err) {
      logger.info(err)
      util.showError(err)
    }
  }),

  /**
   * @methods 设置默认选项值
   */
  setExtendSettings: co.wrap(function* () {
    var duplex = this.data.printterCapacity.duplex
    var color = this.data.printterCapacity.color
    var grayscale = this.data.printterCapacity.grayscale
    this.setData({
      color,
      grayscale,
      isDuplex: duplex, //设置是否支持多面打印
      isColorPrinter: color && grayscale, //黑白彩色模式
    })
  }),

  /**
   * @methods 减少份数
   */
  cutPrintNum: function () {
    if (this.data.copies <= 1) {
      return
    }
    this.data.copies -= 1
    this.setData({
      copies: this.data.copies
    })
  },

  /**
   * @methods 增加份数
   */
  addPrintNum: function () {
    if (this.data.copies < 30) {
      this.data.copies += 1
      return this.setData({
        copies: this.data.copies
      })
    } 
    wx.showModal({
      content: '每次最多打印30份',
      confirmColor: '#2086ee',
      confirmText: "确认",
      showCancel: false
    })
  },

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
   * @param {color} boolean
   */
  checkColor({
    currentTarget: {
      dataset: {
        color
      }
    }
  }) {
    this.data.color = color == 1 ? true : false
    this.setData({
      color: this.data.color,
      grayscale: !this.data.color, // 灰度与彩色取反
    })

  },

  /**
   * @methods 选择单双面打印模式
   * @param {duplex}  boolean
   */
  checkDuplex({
    currentTarget: {
      dataset: {
        duplex
      }
    }
  }) {
    this.data.duplex = duplex == 1 ? true : false
    this.setData({
      duplex: this.data.duplex
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

    var postData = {
      color: this.data.color,
      duplex: this.data.duplex,
      copies: this.data.copies,
      singlePageLayoutsCount: this.data.singlePageLayoutsCount,
      skipGs: this.data.skipGs,
      extract: this.data.extract,
      startPage: this.data.startPage,
      grayscale: thisdata.grayscale,
      endPage: this.data.endPage
    }
    if (this.data.extract !== 'all') {
      postData.startPage = 0
      postData.endPage = 0
    }

    event.emit('setSettingData', postData)
    wxNav.navigateBack()
  },

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

  /**
   * 预览文档
   */
  preview: co.wrap(function* () {
    let url = this.data.setting.orderPms.attributes.url
    let display = this.data.singlePageLayoutsCount
    let skip_gs = !this.data.skipGs
    let extract = this.data.extract || 'all'
    this.longToast.toast({
      type: 'loading',
      title: '正在开启预览',
      duration: 0
    })
    commonRequest.previewDocument({
      feature_key: this.query.featureKey,
      worker_data: {
        url,
        display,
        skip_gs,
        extract
      }
    }, () => {
      this.longToast.hide()
    })
  }),

  /**
   * 强制转换切换
   */
  switchRepair() {
    this.setData({
      skipGs: !this.data.skipGs,
      showConfirm: this.data.skipGs ? false : true,
    })
  },

  /**
   * 强制转换取消
   */
  cancelRepair() {
    this.setData({
      skipGs: false,
      showConfirm: false,
    })
  },

  /**
   * 打开强制转换弹窗
   */
  openRepair: co.wrap(function* () {
    this.setData({
      showConfirm: true
    })
  }),

  /**
   * @methods 选择打印范围类型奇、偶、范围
   * @param {Object} e 
   */
  chooseRangeType(e) {
    let extract = e.currentTarget.id,
      endMaxPage = this.data.endMaxPage,
      endPage = endMaxPage,
      singlePageLayoutsCount = this.data.singlePageLayoutsCount
    if (extract !== 'all') {
      singlePageLayoutsCount = 1
      if (extract === 'odd') {
        endPage = Math.ceil(endMaxPage / 2)
      } else if (extract === 'even') {
        endPage = Math.floor(endMaxPage / 2)
      }
    }
    this.setData({
      singlePageLayoutsCount: singlePageLayoutsCount,
      extract: extract,
      endPrintPage: endPage,
      endPage: endPage,
      totalPage: endPage
    })
  },


  /**
   * 确认调起打印
   */
  confirm: co.wrap(function* (params) {
    if(Boolean(storage.get("hideConfirmPrintBox"))){
      return this.print()
    }

    this.setData({
        ['confirmModal.isShow']: true
    })
  }),

  /**
   * 处理打印参数
   * @return {Object}
   */
  setOrderParams: function () {
   try {
    var checkCapabilitys = this.data.setting.checkCapabilitys
    var pms = {
      ...this.data.setting.orderPms,
     capabilitys: {
      copies: this.data.copies,
      startPage: this.data.startPage,
      endPage: this.data.endPage,
     }
    }
    if (checkCapabilitys.isSettingDuplex) {
      pms.capabilitys.duplex = this.data.duplex
    }

    if (checkCapabilitys.isSettingOddEven) {
      pms.capabilitys.extract = this.data.extract
    }

    if (checkCapabilitys.isSettingSkipGs) {
      pms.capabilitys.skipGs = this.data.skipGs
    }

    if (checkCapabilitys.isSinglePageLayout) {
      pms.capabilitys.singlePageLayoutsCount = this.data.singlePageLayoutsCount
    }

    if (checkCapabilitys.isSettingColor) {
      pms.capabilitys.color = this.data.color
      pms.capabilitys.grayscale = this.data.grayscale
    }
    return pms
   } catch(err) {
     logger.info(err)
   }
  },

  /**
   * 打印订单
   */
  print: co.wrap(function *() {
    try {
      var params = this.setOrderParams()
      var resp = yield printConfig.createOrder({
        printType: this.data.setting.orderPms.printType,
        featureKey: this.data.setting.orderPms.featureKey,
        params
      })

      // 存下订单完成页渲染数据
      resp && storage.put('orderSuccessParams', resp.statistic)

      // 
      resp && wxNav.navigateTo('/pages/finish/index', {
        type: this.data.setting.orderPms.featureKey,
        media_type: this.data.setting.orderPms.featureKey,
        state: resp.state
      })

    } catch(err) {
      util.showError(err)
      console.log(err)
    }
  })

})