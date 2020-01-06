// pages/package_common/common_content/list.js
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
    typeList: [{
        name: '全部'
      }, {
        name: '分类一'
      }, {
        name: '分类二'
      },
      {
        name: '分类三'
      },
      {
        name: '分类四'
      },
    ],
    tabId: 0,
    playList: [{
      icon_url: 'https://cdn-h.gongfudou.com/epbox/backend/2019/11/26/84c12303-be26-4814-a967-6baa1c125af8.jpg',
      title: '哈哈',
      print_count: 23,
      total_page: 10
    }, {
      icon_url: 'https://cdn-h.gongfudou.com/epbox/backend/2019/11/26/84c12303-be26-4814-a967-6baa1c125af8.jpg',
      title: '哈哈',
      print_count: 23,
      total_page: 10
    }, {
      icon_url: 'https://cdn-h.gongfudou.com/epbox/backend/2019/11/26/84c12303-be26-4814-a967-6baa1c125af8.jpg',
      title: '哈哈',
      print_count: 23,
      total_page: 10
    }, {
      icon_url: 'https://cdn-h.gongfudou.com/epbox/backend/2019/11/26/84c12303-be26-4814-a967-6baa1c125af8.jpg',
      title: '哈哈',
      print_count: 23,
      total_page: 10
    }, {
      icon_url: 'https://cdn-h.gongfudou.com/epbox/backend/2019/11/26/84c12303-be26-4814-a967-6baa1c125af8.jpg',
      title: '哈哈',
      print_count: 23,
      total_page: 10
    }, {
      icon_url: 'https://cdn-h.gongfudou.com/epbox/backend/2019/11/26/84c12303-be26-4814-a967-6baa1c125af8.jpg',
      title: '哈哈',
      print_count: 23,
      total_page: 10
    }, ]
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
  changeTab: co.wrap(function* (e) {
    let id = e.currentTarget.id
    id = id.slice(1, id.length)
    if (id == this.data.tabId) {
      return
    }
    this.page = 1
    this.pageEnd = false
    this.setData({
      playList: [],
      tabId: id
    })
    this.setData({
      showTypeModal: false
    })
    // if (id == 0) {
    //   return yield this.getTypeList('getResourse')
    // }
    // yield this.getPlayList()
  }),
  getFeatureTab: co.wrap(function* () {
    this.longToast.toast({
      type: "loading"
    })
    try {
      const resp = yield gql.getFeatureTab()
      logger.info(resp)
    } catch (error) {
      util.showError(error)
    }
  }),
  getFeatureList: co.wrap(function* () {
    this.longToast.toast({
      type: "loading"
    })
    try {
      const resp = yield gql.getFeatureList()
      logger.info(resp)
    } catch (error) {
      util.showError(error)
    }
  }),
  toNextPage(e) {
    router.navigateTo('/pages/package_common/common_content/preview',{
      featureKey:''
    })
   },
  onShareAppMessage: function () {

  },
  onUnload() {
    event.remove('Authorize', this)
  },
})