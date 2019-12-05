// pages/print_doc/index/index.js
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import {
  getLogger
} from '../../../utils/logger'
const logger = new getLogger('pages/print_doc/index/index')
import router from '../../../utils/nav'

Page({
  data: {
    mainEntry: [{
        name: '微信文档',
        recommend: '选择微信聊天文档打印',
        icon: '/images/doc_weixin_icon.png',
        key: 'weChatDoc'
      },
      {
        name: '更多打印方式',
        recommend: '可选qq、百度打印',
        icon: '/images/doc_more_icon.png',
        url: '/pages/print_doc/function_list/function_list',
        key: 'more'
      }
    ],
    minorEntry: [{
        name: '复印',
        recommend: '多种证件复印',
        icon: '/images/doc_copy_icon.png',
        key: 'copy',
        url: '/pages/print_doc/duplicate/index',
      },
      {
        name: '文字速印',
        recommend: '输入文字快速印',
        icon: '/images/doc_font_print_icon.png',
        key: 'font'
      },
      {
        name: '常用文档',
        recommend: '家庭常用归纳',
        icon: '/images/doc_normal_icon.png',
        key: 'normal',
        // url: '/pages/print_doc/library/library',
        query: {
          sn: '1307275099676115'
        }
      },
      {
        name: '公众号文章',
        recommend: '复制链接快速打',
        icon: '/images/doc_official_icon.png',
        key: 'weChatArticle',
        // url: '/pages/print_doc/print_wx/print_wx'
      },
      {
        name: '电子发票',
        recommend: '电子发票随时打',
        icon: '/images/doc_invoice_icon.png',
        key: 'invoice',
        url: '/pages/print_doc/print_invoice/print_invoice'
      }
    ]
  },
  
  /**
   * @methods 入口方法
   */
  toEntry: function ({
    currentTarget: {
      dataset: {
        url,
        query,
        key
      }
    }
  }) {
    try {
      if (key === 'weChatDoc') {
        return this.chooseWeChatFile()
      }

      if (!url) {
        return util.showError({message: '暂未开放'})
      }

      router.navigateTo(url, query || '')
    } catch (err) {
      logger.info('err', err)
    }

  },

  /**
   * @methods 选择微信文档
   */
  chooseWeChatFile: co.wrap(function* () {
    try {
      var res = wx.getSystemInfoSync()
      if (util.compareVersion(res.SDKVersion, '2.5.0')) {
        wx.chooseMessageFile({
          type: 'file',
          count: 5, //暂定最多5个文档
          success: (res) => {
            router.navigateTo('/pages/print_doc/doc_list/doc_list', {
              arrayFile: encodeURIComponent(JSON.stringify(res.tempFiles))
            })
          },
          fail: function () {
            util.showError({
              message: '文件获取失败，请重试~'
            })
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
    } catch (err) {
      logger.info('err', err)
    }

  }),
})