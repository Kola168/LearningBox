// pages/package_common/common_content/preview.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage
} from '../../../utils/common_import.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_common/common_content/index')
const event = require('../../../lib/event/event')
import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'
import commonRequest from '../../../utils/common_request.js'

Page({
  data: {
    detail: null,
    num: 0,
    circular: true,
    collection: false,
    showGetModal: false, //耗材推荐弹窗
    showSetting: false, //显示打印设置
    documentPrintNum: 1, //打印份数
    startPrintPage: 1,
    endPrintPage: 1,
    colorcheck: 'Color', //默认彩色
    duplexcheck: false,
    isColorPrinter: true,
    isDuplex: true,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    },
    butHigh:false
  },
  onLoad: co.wrap(function* (options) {
    this.setData({
      name: options.name
    })
    this.options = options
    console.log(options)
    this.longToast = new app.weToast()
    this.userSn = storage.get('userSn')
    if (!this.userSn) {
      return router.navigateTo('/pages/authorize/index')
    }
    this.sn = options.sn
    yield this.getContent()
    yield this.getCapability()

    event.on('Authorize', this, () => {
      this.userSn = storage.get('userSn')
      this.getContent()
      this.getCapability()
    })
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    } else if (app.isFullScreen == undefined) {
      let that = this
      setTimeout(function() {
        that.setData({
          butHigh: app.isFullScreen
        })
      }, 500)
    }

  }),
  onShow: function () {

  },
  getContent: co.wrap(function* () {
    this.longToast.toast({
      type: "loading"
    })
    try {
      const resp = yield gql.customizeContent(this.options.sn)
      logger.info(resp)
      this.setData({
        detail: resp.content,
        collection: resp.content.contentCollected,
        endPrintPage: resp.content.pageCount
      })
      this.longToast.hide()
    } catch (error) {
      console.log(error)
      this.longToast.hide()
      util.showError(error)
    }
  }),
  collect: co.wrap(function* () {
    this.longToast.toast({
      type: "loading"
    })
    try {
      const resp = yield gql.collectContent({
        sn: this.data.detail.sn,
        type: 'content',
        action: this.data.collection ? 'destroy' : 'create'
      })
      this.setData({
        collection: this.data.collection ? false : true
      })
      this.longToast.hide()
    } catch (error) {
      console.log(error)
      this.longToast.hide()
      util.showError(error)
    }
  }),
  turnImg: co.wrap(function* (e) {
    let num = this.data.num;
    let turn = e.currentTarget.dataset.turn;
    if (turn == 'right') {
      if (num < this.data.detail.contentImages.length - 1) {
        num++;
      } else {
        return
      }
    } else if (turn == 'left') {
      if (num > 0) {
        num--;
      } else {
        return
      }
    }
    this.setData({
      num: num,
      turn: turn
    })
  }),
  tab_slide: function (e) {
    console.log(e.detail.current)
    this.setData({
      num: e.detail.current
    })
  },
  //获取打印能力
  getCapability: co.wrap(function* () {
    this.longToast.toast({
      img: '/images/loading.gif',
      title: '请稍候',
      duration: 0
    })
    try {
      var resp = yield commonRequest.getPrinterCapacity('doc_a4')
      console.log('获取打印能力成功', resp.data)
      this.longToast.toast()
      this.setData({
        isColorPrinter: resp.color,
        isDuplex: resp.duplex
      })
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),
  toConfirm: co.wrap(function* (e) {
    // let unionId = wx.getStorageSync('unionId')
    // if (!unionId) {
    // 	let url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
    // 	return wx.navigateTo({
    // 		url
    // 	})
    // }
    this.setData({
      showSetting: true,
      name: '打印设置'
    })
  }),
  //增加份数
  addPrintNum: co.wrap(function* () {
    console.log(this.data.documentPrintNum)
    this.data.documentPrintNum += 1
    if (this.data.documentPrintNum <= 30) {
      this.setData({
        documentPrintNum: this.data.documentPrintNum
      })
    } else {
      this.setData({
        documentPrintNum: 30
      })
      yield showModal({
        content: '每次最多打印30份',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
      return
    }

  }),
  //输入打印起始页
  inputstartpage: function (e) {
    this.data.startPrintPage = e.detail.value
  },

  startpagejudge: function (e) {
    console.log('起始页===', parseInt(e.detail.value), typeof (e.detail.value))
    if (parseInt(e.detail.value) > parseInt(this.data.endPrintPage) || parseInt(e.detail.value) <= 0) {
      this.setData({
        startPrintPage: 1,
        // startPage: 1
      })
      wx.showModal({
        content: '请输入正确的起始页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
      return
    } else {
      console.log('打印起始页===', e.detail.value)
      this.data.startPrintPage = e.detail.value
    }
  },
  //输入打印结束页
  inputendpage(e) {
    this.data.endPrintPage = e.detail.value
  },
  endpagejudge(e) {
    if (parseInt(e.detail.value) < parseInt(this.data.startPrintPage) || parseInt(e.detail.value) > this.data.detail.contentImages.length) {
      console.log('结束页===', parseInt(e.detail.value), typeof (e.detail.value))
      this.setData({
        endPrintPage: this.data.detail.contentImages.length,
      })
      wx.showModal({
        content: '请输入正确的结束页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
      return
    } else {
      console.log('打印完成页===', e.detail.value)
      this.data.endPrintPage = e.detail.value
    }
  },

  //选择颜色
  colorCheck(e) {
    this.setData({
      colorcheck: e.currentTarget.dataset.style == 'Color' ? true : false
    })
  },

  //选择单双面打印模式
  duplexCheck(e) {
    console.log(e)
    let duplexcheck = e.currentTarget.dataset.style == '0' ? false : true
    this.setData({
      duplexcheck: duplexcheck
    })
  },
  //确认按钮提交
  confcheck() {
    if (this.data.startPrintPage == '') {
      wx.showModal({
        content: '请输入正确的开始页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
      return
    }

    if (this.data.endPrintPage == '') {
      wx.showModal({
        content: '请输入正确的结束页',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
      return
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
  print: co.wrap(function* (e) {
    try {
      this.longToast.toast({
        type: 'loading'
      })

      let that = this
      let p = {
        featureKey: this.data.detail.featureKey,
        resourceOrderType: 'Resource',
        resourceAttribute: {
          resourceType: 'Content',
          sn: this.data.detail.sn,
          copies: that.data.documentPrintNum,
          startPage: Number(that.data.startPrintPage),
          endPage: Number(that.data.endPrintPage),
          duplex: that.data.duplexcheck,
          color: true,
          // categorySns:this.options.categorySns
        }
      }
      try {

        const resp = yield gql.createCommonResourceOrder(p)

        console.log(resp)
        router.redirectTo('/pages/finish/index', {
          media_type: 'preschool_content',
          state: resp.createResourceOrder.state
        })
        this.longToast.hide()
      } catch (e) {
        this.longToast.hide()
        util.showError(e)
      }
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  onShareAppMese: function () {

  },
  onUnload() {
    event.remove('Authorize', this)
  },
})