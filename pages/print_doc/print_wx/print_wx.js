// pages/print_wx/index.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')

const request = util.promisify(wx.request)
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/print_doc/print_wx/print_wx')
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
      'https://cdn-h.gongfudou.com/LearningBox/main/doc_wx_article1.png',
      'https://cdn-h.gongfudou.com/LearningBox/main/doc_wx_article2.png',
      'https://cdn-h.gongfudou.com/LearningBox/main/doc_wx_article3.png'
    ]
  },
  onLoad: co.wrap(function* () {
    this.longToast = new app.weToast()
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
      util.showError(e)
    }
  }),

  // changeTab: co.wrap(function* (e) {
  //   var id = e.currentTarget.id
  //   this.page = 1
  //   this.pageEnd = false
  //   this.setData({
  //     textList: [],
  //     tabId: id
  //   })
  //   yield this.getText()
  // }),

  /**
   * @methods 自动填充剪切板链接
   */
  getLink () {
    var _this = this
    wx.getClipboardData({
      success(res) {
        if (res.data.indexOf("https://mp.weixin.qq.com") == 0) {
          _this.setData({
            input: res.data
          })
          return util.showError({
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

  /**
   * @methods 绑定值
   * @param {Object} e 
   */
  bindValue (e) {
    this.setData({
      input: e.detail.value
    })
  },

  /**
   * @methods 生成链接
   */
  createLink: co.wrap(function* () {
    var input = this.data.input

    if (input == '') {
      return util.showError({
        message: '请输入微信文章链接'
      })
    }
    if (input.indexOf("https://mp.weixin.qq.com") == 0) {
      
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
        util.showError(e)
      }
    } else {
      return util.showError({
        message: '此链接已失效，请检查链接输入是否正确'
      })
    }
  }),

  // toSetting: co.wrap(function* ({currentTarget: {id}}) {
  //   var pdf = this.data.textList[id].pdf_url
  //   this.setData({
  //     pdf: pdf
  //   })
  //   router.navigateTo('/pages/print_doc/print_wx_setting/print_wx_setting', {
  //     converted_url: encodeURIComponent(JSON.stringify(this.data.pdf)),
  //     from: 'list'
  //   })
  // }),

  // toSubscribe: co.wrap(function* (e) {
  //   yield this.getSubscribe()
  //   router.navigateTo('/pages/print_doc/print_wx_subscribe/print_wx_subscribe', {
  //     user_id: this.user_id,
  //     publicType: JSON.stringify(this.data.subscription)
  //   })
   
  // }),

  // getPublicType: co.wrap(function* (e) {
  //   this.longToast.toast({
  //     type: 'loading',
  //     title: '请稍候'
  //   })
  //   try {
  //     const resp = yield request({
  //       url: `https://ta.dc.gongfudou.com/api/wx_article/getPublicType`,
  //       method: 'GET',
  //       dataType: 'json'
  //     })
  //     if (resp.data.code !== 0) {
  //       throw (resp.data)
  //     }
  //     this.longToast.hide()
  //     this.setData({
  //       publicType: resp.data.data
  //     })
  //   } catch (e) {
  //     this.longToast.hide()
  //     util.showError(e)
  //   }
  // }),

  // getSubscribe: co.wrap(function* (e) {
  //   this.longToast.toast({
  //     type: 'loading',
  //     title: '请稍候',
  //   })
  //   let params = {
  //     user_id: this.user_id,
  //   }
  //   try {
  //     const resp = yield request({
  //       url: `https://ta.dc.gongfudou.com/api/wx_article/getPublicType`,
  //       method: 'GET',
  //       dataType: 'json',
  //       data: params
  //     })
  //     if (resp.data.code !== 0) {
  //       throw (resp.data)
  //     }
  //     this.setData({
  //       subscription: resp.data.data
  //     })
  //     this.longToast.hide()

  //   } catch (e) {
  //     this.longToast.hide()
  //     util.showError(e)
  //   }
  // }),

  // getText: co.wrap(function* (e) {
  //   this.longToast.toast({
  //     type: 'loading',
  //     title: '请稍候',
  //   })
  //   if (this.page == 1) {
  //     this.setData({
  //       textList: []
  //     })
  //     this.pageEnd = false
  //   }
  //   this.setData({
  //     id: this.data.publicType[this.data.tabId].id
  //   })
  //   var params = {
  //     public_type: this.data.id,
  //     user_id: this.user_id,
  //     page: this.page,
  //     size: '10'
  //   }
  //   try {
  //     const resp = yield request({
  //       url: `https://ta.dc.gongfudou.com/api/wx_article/getWxArticle`,
  //       method: 'GET',
  //       dataType: 'json',
  //       data: params
  //     })
  //     if (resp.data.code !== 0) {
  //       throw (resp.data)
  //     }
  //     if (resp.data.data.length < 10) {
  //       this.pageEnd = true
  //     }
  //     if (resp.data.data.length == 0) {
  //       return
  //     }
  //     this.setData({
  //       textList: this.data.textList.concat(resp.data.data)
  //     })
  //     this.longToast.hide()
  //     this.page++
  //   } catch (e) {
  //     this.longToast.hide()
  //     util.showError(e)
  //   }
  // }),

  // playPreview: co.wrap(function* (e) {
  //   this.longToast.toast({
  //     type: 'loading',
  //     title: '请稍候'
  //   })
  //   var id = parseInt(e.currentTarget.id)
  //   var pdf = this.data.textList[id].pdf_url
  //   var _this = this

  //   _this.setData({
  //     pdf: pdf
  //   })
  //   wx.downloadFile({
  //     url: _this.data.pdf,
  //     success(res) {
  //       if (res.statusCode === 200) {
  //         _this.longToast.hide()
  //         wx.openDocument({
  //           filePath: res.tempFilePath
  //         })
  //       }
  //     },
  //     fail(e) {
  //       // console.log('e=====', e)
  //     }
  //   })
  // })
})