// pages/package_common/common_content/preview.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../utils/common_import.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_common/common_content/index')
const event = require('../../../lib/event/event')
import router from '../../../utils/nav'
Page({
  data: {
    detail:{
      preview_urls:[
        'https://cdn-h.gongfudou.com/tmp/2019/10/25/e1acc050-0f65-11ea-a645-0bb7b7a5fdc4-out.jpg?x-image-process=image/resize,h_800/quality,Q_85/format,jpg',
        'https://cdn-h.gongfudou.com/tmp/2019/10/25/e1acc050-0f65-11ea-a645-0bb7b7a5fdc4-out.jpg?x-image-process=image/resize,h_800/quality,Q_85/format,jpg',
        'https://cdn-h.gongfudou.com/tmp/2019/10/25/e1acc050-0f65-11ea-a645-0bb7b7a5fdc4-out.jpg?x-image-process=image/resize,h_800/quality,Q_85/format,jpg'
      ]
    }
  },
  onLoad: co.wrap(function* (options) {
    this.options=options
    this.longToast = new app.weToast()
    this.userSn = storage.get('userSn')
    if (!this.userSn) {
      return router.navigateTo('/pages/authorize/index')
    }
    // yield this.getContent()

    event.on('Authorize', this, () => {
      this.userSn = storage.get('userSn')
    })
  }),
  onShow: function () {

  },
  onShareAppMessage: function () {

  },
  onUnload() {
    event.remove('Authorize', this)
  },
})