// pages/print_doc/index/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import router from '../../../utils/nav'
Page({
  data: {
    mainEntry: [
      {
        name: '微信文档',
        recommend: '选择微信聊天文档打印',
        icon: '/images/print_doc/doc_weixin_icon.png',
        key: 'weChatDoc'
      },
      {
        name: '更多打印方式',
        recommend: '可选qq、百度打印',
        icon: '/images/print_doc/doc_more_icon.png',
        url: '/pages/print_doc/function_list/function_list',
        key: 'more'
      }
    ],
    minorEntry: [
      {
        name: '复印',
        recommend: '多种证件复印',
        icon: '/images/print_doc/doc_copy_icon.png',
        key: 'copy'
      },
      {
        name: '文字速印',
        recommend: '输入文字快速印',
        icon: '/images/print_doc/doc_font_print_icon.png',
        key: 'font'
      },
      {
        name: '常用文档',
        recommend: '家庭常用归纳',
        icon: '/images/print_doc/doc_normal_icon.png',
        key: 'normal'
      },
      {
        name: '公众号文章',
        recommend: '复制链接快速打',
        icon: '/images/print_doc/doc_official_icon.png',
        key: 'weChatArticle'
      },
      {
        name: '电子发票',
        recommend: '电子发票随时打',
        icon: '/images/print_doc/doc_invoice_icon.png',
        key: 'invoice'
      }
    ]
  },
  onLoad (options) {

  },
  onShow () {

  },
  toEntry: function({currentTarget: {dataset: {url, query, key}}}) {
    console.log('xxxxxx', key)
    if (key === 'weChatDoc') {
      return this.chooseWeChatFile()
    }

    router.navigateTo(url, query)

  },

  // 选择微信文档
  chooseWeChatFile: co.wrap(function* () {
      var SDKVersion
      try {
        const res = wx.getSystemInfoSync()
        SDKVersion = res.SDKVersion
        if (util.compareVersion(SDKVersion, '2.5.0')) {
          wx.chooseMessageFile({
            type: 'file',
            count: 5, //暂定最多5个文档
            success: (res) => {
                router.navigateTo('/pages/print_doc/doc_list/doc_list', {
                  arrayFile: encodeURIComponent(JSON.stringify(res.tempFiles))
                })
            },
            fail: function () {
                util.showErr({message: '文件获取失败，请重试~'})
            }
          })
        } else {
          //请升级到最新的微信版本
          yield showModal({
            title: '微信版本过低',
            content: '请升级到最新的微信版本',
            confirmColor: '#2086ee',
            confirmText: "确认",
            showCancel: false
          })
        }
      } catch (e) {
          console.log(e)
      }
     
  }),

  onPullDownRefresh () {

  },

  onShareAppMessage () {

  }
})