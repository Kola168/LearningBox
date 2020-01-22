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
    playList: [],
    butHigh:false
  },
  onLoad: co.wrap(function* (options) {
    this.setData({
      name: options.name
    })
    this.options = options
    console.log(options)
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
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    } else if (app.isFullScreen == undefined) {
      let that = this
      setTimeout(function() {
        that.setData({
          butHigh: app.isFullScreen
        })
      }, 500)
    }

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
      this.longToast.hide()
      this.setData({
        typeList: resp.customizeCategory
      })
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
    if (this.data.typeList.length == 0) {
      return
    }
    this.longToast.toast({
      type: "loading"
    })
    this.longToast.hide()
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
        playList: this.data.playList.concat(resp.customizeContents)
      })
      this.page++
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  }),
  toNextPage(e) {
    router.navigateTo('/pages/package_common/common_content/preview', {
      sn: e.currentTarget.id,
      name: e.currentTarget.dataset.name,
      // categorySns:this.data.typeList[this.data.tabId].sn
    })
  },
  onShareAppMessage: function (res) {
    console.log('paly preview res====', res, res[0])
		res = res[0]
		if (res.from === 'button') {
			return {
				title: this.title,
				path: `/pages/package_common/common_content/preview?sn=${this.options.sn}&userSn=${this.userSn}&name=${this.data.name}&type_id=${this.type_id}`
			}
		} else {
			return app.share
		}
  },
  onReachBottom: function () {
    console.log('分页加载')
    console.log('this.pageEnd', this.pageEnd)
    if (this.pageEnd) {
      return
    }
    this.getFeatureList()
  },
  onUnload() {
    event.remove('Authorize', this)
  },
})