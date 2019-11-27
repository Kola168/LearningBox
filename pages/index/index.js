const app = getApp()
import wxNav from '../../utils/nav.js'
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

// page mixins
require('../../utils/mixin.js')
import index from "../../mixins/index.js"
import init from "../../mixins/init.js"

import storage from '../../utils/storage.js'

Page({
  mixins: [index, init],
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    blockSize: 10,
    audioType:'circle',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    bannerUrls:[{
      url:'http://gfd-i.memeyin.com/e-FlXfVks1do_li3DqrLWVHjr-0IPr'
    }]

  },

  //事件处理函数
  bindViewTap: function() {
    wxNav.navigateTo('/pages/logs/logs')
  },
  onLoad: function() {
    logger.error('123456789')
    logger.warn('123456789')
    logger.info('1234567890000', '6789')
    logger.debug('123456789')
    storage.put('hello', '123')

    console.log('initMsg=====', this.data.initMsg)
    this.longToast = new app.weToast()
    this.longToast.toast({
      type: "loading",
      duration: 3000
    })
  }
})