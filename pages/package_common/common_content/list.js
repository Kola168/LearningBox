// pages/package_common/common_content/list.js
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

Page({
  data: {
    typeList: [],
    tabId: -1,
    playList: []
  },
  onLoad: co.wrap(function* (options) {
    this.setData({
      name: options.name
    })
    this.options = options
    this.longToast = new app.weToast()
    this.userSn = storage.get('userSn')
    if (!this.userSn) {
      return router.navigateTo('/pages/authorize/index')
    }
    this.page = 1
    this.pageEnd = false
    yield this.getFeatureTab()

    event.on('Authorize', this, () => {
      this.userSn = storage.get('userSn')
      this.getFeatureTab()
    })
  }),
  onShow: function () {

  },
  changeTab: co.wrap(function* (e) {
    try {
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
      // this.setData({
      //   showTypeModal: false
      // })
      yield this.getFeatureList()
    } catch (error) {
      console.log(error)
    }
  }),
  getFeatureTab: co.wrap(function* () {
    this.longToast.toast({
      type: "loading"
    })
    try {
      const resp = yield gql.customizeCategory(this.options.sn)
      logger.info(resp)
      this.setData({
        typeList: resp.customizeCategory
      })
      this.longToast.hide()
      yield this.changeTab({
        currentTarget: {
          id: '_0'
        }
      })
    } catch (error) {
      console.log(error)
      this.longToast.hide()
      util.showError(error)
    }
  }),
  getFeatureList: co.wrap(function* () {
    this.longToast.toast({
      type: "loading"
    })
    if (this.page == 1) {
      this.setData({
        playList: []
      })
    }
    this.pageEnd = false
    try {
      console.log(this.data.typeList[this.data.tabId].sn, this.page)
      const resp = yield gql.customizeContents(this.data.typeList[this.data.tabId].sn, this.page.toString())
      logger.info(resp)
      if (resp.customizeContents.length < 20) {
        this.pageEnd = true
      }
      if (resp.customizeContents.length == 0) {
        return
      }
      this.setData({
        playList: resp.customizeContents
      })
      this.page++
      this.longToast.hide()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  }),
  toNextPage(e) {
    router.navigateTo('/pages/package_common/common_content/preview', {
      sn: e.currentTarget.id,
      name: e.currentTarget.dataset.name
    })
  },
  onShareAppMessage: function () {

  },
  onUnload() {
    event.remove('Authorize', this)
  },
})