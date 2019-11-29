// pages/print_wx/index.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')

const request = util.promisify(wx.request)
// var mta = require('../../../utils/mta_analysis.js');
import router from '../../../utils/nav'
// import commonRequest from '../../utils/common_request.js'
Page({
  data: {
    input: '',
    showGetModal: false, //耗材推荐弹窗
    supply_types: '',
    consumablesIcon: false, //耗材推荐图标
    tabId: 0,
    publicType: '',
    textList: '',
    subscription: '',
    imgList: [
      'https://cdn.gongfudou.com/miniapp/ec/wx_article1.png',
      'https://cdn.gongfudou.com/miniapp/ec/wx_article2.png',
      'https://cdn.gongfudou.com/miniapp/ec/wx_article3.png'
    ]
  },
  onLoad: co.wrap(function* (options) {
    mta.Page.init()
    this.longToast = new app.WeToast()
    this.page = 1
    this.pageEnd = false
    this.getLink()
    yield this.getUserId()

  }),

  getUserId: co.wrap(function* () {
    try {
      const resp = yield request({
        url: app.apiServer + `/ec/v2/users/user_id`,
        method: 'GET',
        dataType: 'json',
        data: {
          openid: app.openId
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      this.user_id = resp.data.user_id
    } catch (e) {
      util.showErr(e)
    }
  }),
  changeTab: co.wrap(function* (e) {
    var id = e.currentTarget.id
    mta.Event.stat("wxarticletype", {
      'wxarticletype': this.data.publicType[parseInt(id)]
    })
    this.page = 1
    this.pageEnd = false
    this.setData({
      textList: [],
      tabId: id
    })
    yield this.getText()
  }),

  getLink () {
    var _this = this
    wx.getClipboardData({
      success(res) {
        if (res.data.indexOf("https://mp.weixin.qq.com") == 0) {
          mta.Event.stat('copywxarticle', {
            'copywxarticle': 'true'
          })
          _this.setData({
            input: res.data
          })
          return util.showErr({
            message: '链接获取成功'
          })
        }
      },
      fail(e) {
      }
    })
  },

  introduction: function () {
    router.navigateTo('/pages/print_doc/print_wx_introduction/print_wx_introduction')
  },

  input: function (e) {
    this.setData({
      input: e.detail.value
    })
  },

  toSetting: co.wrap(function* ({currentTarget: {id}}) {
    var pdf = this.data.textList[id].pdf_url
    mta.Event.stat("wxarticleindexlistprint", {
      'wxarticleindexlistprint': this.data.textList[id].article_title
    })
    this.setData({
      pdf: pdf
    })
    router.navigateTo('/pages/print_doc/print_wx_setting/print_wx_setting', {
      converted_url: encodeURIComponent(JSON.stringify(this.data.pdf)),
      from: 'list'
    })
  }),

  next: co.wrap(function* () {
    var input = this.data.input
    if (input == '') {
      return util.showErr({
        message: '请输入微信文章链接'
      })
    }
    if (input.indexOf("https://mp.weixin.qq.com") == 0) {
      mta.Event.stat("wxarticlenext", {
        'wxarticlenext': 'true'
      })

      this.longToast.toast({
        type: 'loading',
        title: '请稍候'
      })
      try {
        var resp = yield request({
          url: app.apiServer + `/ec/v2/wx_files`,
          method: 'POST',
          dataType: 'json',
          data: {
            url: input
          }
        })
        if (resp.data.code != 0) {
          throw (resp.data)
        }
        var converted_url = resp.data.converted_url
        this.longToast.hide()
        router.navigateTo('/pages/print_doc/print_wx_setting/print_wx_setting', {
          link: encodeURIComponent(JSON.stringify(input)),
          converted_url: encodeURIComponent(JSON.stringify(converted_url)),
          pages: resp.data.pages,
          from: 'next'
        })

      } catch (e) {
        this.longToast.hide()
        util.showErr(e)
      }
    } else {
      return util.showErr({
        message: '此链接已失效，请检查链接输入是否正确'
      })
    }
  }),

  toSubscribe: co.wrap(function* (e) {
    yield this.getSubscribe()
    router.navigateTo('/pages/print_doc/print_wx_subscribe/print_wx_subscribe', {
      user_id: this.user_id,
      publicType: JSON.stringify(this.data.subscription)
    })
   
  }),

  getPublicType: co.wrap(function* (e) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      const resp = yield request({
        url: `https://ta.dc.gongfudou.com/api/wx_article/getPublicType`,
        method: 'GET',
        dataType: 'json'
      })
      if (resp.data.code !== 0) {
        throw (resp.data)
      }
      this.longToast.hide()
      this.setData({
        publicType: resp.data.data
      })
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  getSubscribe: co.wrap(function* (e) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候',
    })
    let params = {
      user_id: this.user_id,
    }
    try {
      const resp = yield request({
        url: `https://ta.dc.gongfudou.com/api/wx_article/getPublicType`,
        method: 'GET',
        dataType: 'json',
        data: params
      })
      if (resp.data.code !== 0) {
        throw (resp.data)
      }
      this.longToast.hide()
      this.setData({
        subscription: resp.data.data
      })
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  getText: co.wrap(function* (e) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候',
    })
    console.log("this.page", this.page)
    if (this.page == 1) {
      this.setData({
        textList: []
      })
      this.pageEnd = false
    }
    this.setData({
      id: this.data.publicType[this.data.tabId].id
    })
    var params = {
      public_type: this.data.id,
      user_id: this.user_id,
      page: this.page,
      size: '10'
    }
    try {
      const resp = yield request({
        url: `https://ta.dc.gongfudou.com/api/wx_article/getWxArticle`,
        method: 'GET',
        dataType: 'json',
        data: params
      })
      if (resp.data.code !== 0) {
        throw (resp.data)
      }
      this.longToast.hide()
      if (resp.data.data.length < 10) {
        this.pageEnd = true
      }
      if (resp.data.data.length == 0) {
        return
      }
      this.setData({
        textList: this.data.textList.concat(resp.data.data)
      })
      this.page++
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  playPreview: co.wrap(function* (e) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候',
      duration: 0
    })
    var id = parseInt(e.currentTarget.id)
    let pdf = this.data.textList[id].pdf_url
    this.setData({
      pdf: pdf
    })
    mta.Event.stat("wxarticleindexlistpreview", {
      'wxarticleindexlistpreview': this.data.textList[id].article_title
    })
    let _this = this
    wx.downloadFile({
      url: _this.data.pdf,
      success(res) {
        if (res.statusCode === 200) {
          console.log(res.tempFilePath)
          _this.longToast.toast()
          wx.openDocument({
            filePath: res.tempFilePath
          })
        }
      },
      fail(e) {
        // console.log('e=====', e)
      }
    })
  }),

  controlModal: co.wrap(function* (e) {
    this.setData({
      showGetModal: true
    })
  }),
  hideModal: co.wrap(function* (e) {
    this.setData({
      showGetModal: false
    })
  }),

  setFirst: co.wrap(function* (e) {
    wx.setStorageSync('isFisrt', '1')
  }),

  isFirst: co.wrap(function* (e) {
    var isFir = wx.getStorageSync('isFisrt')
    if (isFir) {
      this.setData({
        showGetModal: false
      })
    } else {
      this.setData({
        showGetModal: true
      })
    }
  }),

})