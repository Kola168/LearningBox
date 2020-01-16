// pages/error_book/pages/print_speed/index.js
"use strict"

const app = getApp()
// import api from '../../../../network/api'
// import {
//   regeneratorRuntime,
//   co,
//   util,
//   _,
// } from '../../../../utils/common_import'
// import commonRequest from '../../../../utils/common_request.js'
// const request = util.promisify(wx.request)
// const showModal = util.promisify(wx.showModal)
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../../utils/common_import.js'
import api from '../../../network/restful_request.js'
import commonRequest from '../../../utils/common_request'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
const event = require('../../../lib/event/event')

Page({
  data: {
    size: [{
        value: '14',
      },
      {
        value: '16',
      },
      {
        value: '18',
      },
      {
        value: '20',
      },
      {
        value: '22',
      },
      {
        value: '24',
      },
      {
        value: '26',
      }
    ],
    chooseSize: '16',
    fontSize: '16',
    select: false,
    placeholder: '点击即可输入内容',
    first: true,
    documentPrintNum: 1,
    startPrintPage: 1,
    showBottomContent: true,
    isDuplex: true,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    }
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    // this.getClipboard()
    let media_type = 'words2doc'
    this.setData({
      mediumRecommend: media_type
    })
  },
  onShow: function () {
    let hasAuthPhoneNum = Boolean(wx.getStorageSync('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },
  setting: co.wrap(function* (e) {
    console.log('e.currentTarget.id', e)
    let url = this.data.url
    console.log('请求参数', app.openId, url)
    //获取打印能力
    let print_capability = yield commonRequest.getPrinterCapability(url)
    console.log('获取打印能力成功', print_capability)
    this.setData({
      isDuplex: print_capability.media_sizes[0].duplex ? true : false
    })
  }),

  //选择单双面打印模式
  duplexCheck(e) {
    let duplexcheck = e.currentTarget.dataset.style == '0' ? false : true
    this.setData({
      duplexcheck: duplexcheck
    })
  },

  toSelect: function () {
    this.setData({
      select: !this.data.select
    })
  },

  mySelect: function (e) {
    console.log(e)
    this.setData({
      chooseSize: this.data.size[e.currentTarget.id].value,
      fontSize: this.data.size[e.currentTarget.id].value,
      select: false
    })
  },

  setBeforeContent: function () {
    let that = this
    console.log('this.inputContent====*====', this.inputContent)
    if (this.inputContent) {
      that.editorCtx.setContents({
        html: that.inputContent,
        success: function () {
          console.log('insert return html success')
        }
      })
    }
  },

  changeSize: function (e) {
    console.log(e)
    this.setData({
      tabId: e.currentTarget.id
    })
    this.format(e)
  },

  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      console.log("aaaaaaa", res)
      that.editorCtx = res.context
    }).exec(function () {
      that.setBeforeContent()
    })

  },

  format(e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    console.log('format', name, value)
    this.editorCtx.format(name, value)

  },

  input(e) {
    this.tmpContent = e.detail.html
  },

  onStatusChange(e) {
    const formats = e.detail
    this.setData({
      formats
    })
  },

  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
        this.inputContent = ''
      }
    })
  },

  requestSave: co.wrap(function* (htmlContent) {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      console.log("ssssss", htmlContent, this.data.chooseSize + 'px')
      const resp = yield api.wordsPreview(htmlContent, this.data.chooseSize + 'px')
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('保存修改', resp)
      this.setData({
        first: false,
        pages: resp.pages,
        url: resp.converted_url,
        endPrintPage: resp.pages,
      })
      this.longToast.hide()
      this.setting()
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  save: co.wrap(function* () {
    let that = this
    this.inputContent = this.tmpContent
    console.log('this.inputContent）））））%%***', this.inputContent)
    that.editorCtx.getContents({
      success: function (e) {
        console.log('this.tmpContent==end===', that.tmpContent)
        console.log('确认编提交内容', e.html)
        console.log('确认编辑提交that.inputContent', that.inputContent)
        if (that.inputContent == undefined || that.inputContent.replace(/(^\s*)|(\s*$)/g, "") == "" || that.inputContent.replace(/(^\s*)|(\s*$)/g, "") == '<p><br></p>') {
          console.log("qqqq")
          wx.showModal({
            content: '暂未输入内容哦~',
            showCancel: false,
            confirmColor: '#ffe27a'
          })
          return
        } else {
          that.requestSave(e.html)

        }
      }
    })
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
    if (parseInt(e.detail.value) < parseInt(this.data.startPrintPage) || parseInt(e.detail.value) > this.data.pages) {
      console.log('结束页===', parseInt(e.detail.value), typeof (e.detail.value))
      this.setData({
        endPrintPage: this.data.pages,
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

  //减少份数
  cutPrintNum: function () {
    if (this.data.documentPrintNum <= 1) {
      return
    }
    this.data.documentPrintNum -= 1
    this.setData({
      documentPrintNum: this.data.documentPrintNum
    })
  },

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


  //确认按钮提交
  confcheck() {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
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
  getPhoneNumber: co.wrap(function* (e) {
    yield app.getPhoneNum(e)
    wx.setStorageSync("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.confcheck(e)
  }),

  print: co.wrap(function* (e) {
    this.longToast.toast({
      type: 'loading'
    })
    let urls = [];
    let that = this
    urls.push({
      "url": that.data.url,
      "number": that.data.documentPrintNum,
      "start_page": that.data.startPrintPage,
      "end_page": parseInt(that.data.endPrintPage),
      'duplex': that.data.duplexcheck,
    })
    console.log(urls)

    let params = {
      openid: app.openId,
      media_type: 'words2doc',
      urls: urls,
    }
    console.log('打印参数', params)
    try {
      const resp = yield request({
        url: app.apiServer + `/ec/v2/orders`,
        method: 'POST',
        dataType: 'json',
        data: params
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      console.log('打印成功', resp.data)
      wx.redirectTo({
        url: `/pages/finish/index?type=words2doc&&state=${resp.data.order.state}`
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  cancelcheck: function () {
    this.setData({
      first: true, //是否保存修改
      showClear: false //弹窗
    })
  },

  toPreview: co.wrap(function* (e) {
    yield commonRequest.previewDocument(this.data.url)
  }),

  onUnload: function () {
    this.inputContent = ''
    this.tmpContent = ''
  },
})