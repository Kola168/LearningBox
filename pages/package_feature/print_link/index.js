// pages/package_feature/print_link/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql/feature'
import commonRequest from '../../../utils/common_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    linkVal: '',
    linkHead: ['https://mp.weixin.qq.com', 'baidu.com', 'https://article.xuexi.cn/'],
    modalInfo: {
      title: '温馨提示',
      content: '已检测到复制的文章链接，请点击“下一步”按钮预览文章样式',
      cancelText: '暂不使用',
      confirmText: '确认使用',
      confirmBg: '#FFDC5E;'
    },
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
  },

  modelType: 'checkLink',

  onShow: function() {
    let that = this
    wx.getClipboardData({
      success(res) {
        if (that.checkLinkVal(res.data)) {
          that.selectComponent("#modal").showModal({
            title: '温馨提示',
            content: '已检测到复制的文章链接，请点击“下一步”按钮预览文章样式',
            cancelText: '暂不使用',
            confirmText: '确认使用',
            confirmBg: '#FFDC5E;'
          })
          that.data.linkVal = res.data
          that.modelType = 'checkLink'
        }
      },
      fail(e) {
        Loger('loanjie eeee', e)
      }
    })
  },

  modelConfirm: function(e) {
    if (this.modelType == 'checkLink') {
      this.setData({
        linkVal: this.data.linkVal
      })
      this.checkLink()
    }
  },

  checkLinkVal: function(val) {
    try {
      if (_.find(this.data.linkHead, function(link) { return val.indexOf(link) >= 0 })) {
        return true
      } else {
        return false
      }
    } catch (e) {
      Loger(e)
      return false
    }
  },

  checkLink: co.wrap(function*() {
    if (this.checkLinkVal(this.data.linkVal)) {
      try {
        this.longToast.toast({
          type: 'loading'
        })
        let resp = yield graphql.wxFile({
          url: this.data.linkVal
        })
        this.longToast.toast()
        wxNav.navigateTo('/pages/package_common/setting/setting', {
          settingData: encodeURIComponent(JSON.stringify({
            isPreview:true,
            file: {
              name: '1111',
            },
            orderPms: {
              printType: 'PRINTDOC',
              pageCount: resp.wxFile.pages,
              featureKey: 'link',
              originalUrl:resp.wxFile.convertedUrl,
              url:resp.wxFile.convertedUrl,
            },
            checkCapabilitys: {
              isSettingDuplex: true, //是否设置单双面
              isSettingColor: true, //是否设置色彩
              isSettingOddEven: true, //是否设置奇偶
              isSinglePageLayout: true //是否支持缩放
            }
          }))
        })
      } catch (e) {
        this.longToast.toast()
        Loger(e)
        this.modelType = 'showErr'
        this.selectComponent("#modal").showModal({
          title: '温馨提示',
          content: e.errors[0].message || '此链接暂时无法使用，请检查是否为有效链接',
          showCancel: false,
          confirmText: '确认',
          confirmBg: '#FFDC5E;'
        })
      }
    } else {
      this.modelType = 'showErr'
      this.selectComponent("#modal").showModal({
        title: '温馨提示',
        content: '此链接暂时无法使用，请检查是否为有效链接',
        showCancel: false,
        confirmText: '确认',
        confirmBg: '#FFDC5E;'
      })
    }
  }),

  inputValue: function(e) {
    this.setData({
      linkVal: e.detail.value
    })
  },

  bindTips: function() {
    wxNav.navigateTo('pages/package_feature/print_link/typeList')
  },

})
