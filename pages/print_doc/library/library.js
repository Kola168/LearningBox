// pages/library/play.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const request = util.promisify(wx.request)
const event = require('../../../lib/event/event')
import graphql from '../../../network/graphql_request'
import storage from '../../../utils/storage'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/print_doc/library/library')

Page({
  data: {
    tabId: '0',
    playWidth: 0,
    showMore: false,
    typeList: [],
    playList: [],
    allList: [],
    show_type: '', //横向列表or纵向
    from_temp: false,
    showTypeModal: false,
    isAndroid: false,
    isMember: false
  },

  onLoad: co.wrap(function* (options) {
    if (options.scene) {
      let scene = options.scene.split('_')
      this.id = scene[0]
    } else {
      this.id = options.sn //益智一级分类
    }
    this.longToast = new app.weToast()
    this.page = 1
    this.pageEnd = false
    var systemInfo = wx.getSystemInfoSync()
    this.setData({
      isAndroid: systemInfo.system.indexOf('iOS') > -1 ? false : true
    })
    var unionId = storage.get('unionId')

    if (unionId) {
      yield this.loopGetOpenId()
    }
    event.on('Authorize', this, function (data) {
      this.loopGetOpenId()
    })
    let refer = wx.getLaunchOptionsSync()
    if (refer.scene === 1014) {
      this.setData({
        from_temp: true
      })
    }
    if (app.activeDevice.is_3115) {
      this.setData({
        is_3115: true
      })
    }
  }),

  backToHome: function () {
    try {
      router.switchTab('/pages/index/index')
    } catch (err) {
      logger.info(err)
    }
  },

  onShow: co.wrap(function* (options) {
    let unionId = storage.get('unionId')
    logger.info('应用二维码参数传参', this.share_user_id, this.way)
    if (!unionId) {
      let url = this.share_user_id ? `/pages/authorize/index` : `/pages/authorize/index`
      router.navigateTo(url, this.share_user_id ? {
        url: url,
        share_user_id: this.share_user_id,
        way: this.way
      } : null)
    }
  }),

  loopGetOpenId: co.wrap(function* () {
    let loopCount = 0
    let _this = this
    if (app.openId) {
      logger.info('openId++++++++++++----', app.openId)
      yield this.getTypeList()
      yield this.member()
      return
    } else {
      setTimeout(function () {
        loopCount++
        if (loopCount <= 100) {
          logger.info('openId not found loop getting...')
          _this.loopGetOpenId()
        } else {
          logger.info('loop too long, stop')
        }
      }, 2000)
    }
  }),

  openTypeModal: function () {
    this.setData({
      showTypeModal: true
    })
  },

  closeTypeModal: function (e) {
    this.setData({
      showTypeModal: false
    })
  },

  back: function () {
    return
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
    if (id == 0) {
      return yield this.getTypeList('getResourse')
    }
    yield this.getPlayList()
  }),

  getTypeList: co.wrap(function* (data) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    if (this.page == 1) {
      this.setData({
        playList: []
      })
      this.pageEnd = false
    }
    try {
      const resp = yield request({
        url: app.apiServer + `/boxapi/v2/resource_categories/${this.id}`,
        method: 'GET',
        dataType: 'json',
        data: {
          'page': this.page
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      logger.info('益智列表页' , this.page, resp)
      this.longToast.hide()
      if (data != 'getResourse') {
        resp.data.res.sub_category.unshift({
          name: '全部'
        })
        this.setData({
          typeList: resp.data.res.sub_category,
        })
      }
      if (resp.data.res.resources.length < 20) {
        this.pageEnd = true
      }
      if (resp.data.res.resources.length == 0) {
        return
      }
      this.setData({
        playList: this.data.playList.concat(resp.data.res.resources),
        show_type: resp.data.res.resources.length > 0 ? resp.data.res.resources[0].attachment_type : ''
      })
      this.page++
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  getPlayList: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })

    if (this.page == 1) {
      this.setData({
        playList: []
      })
      this.pageEnd = false
    }
    try {
      const resp = yield request({
        url: app.apiServer + `/boxapi/v2/resource_categories/${this.data.typeList[this.data.tabId].sn}`,
        method: 'GET',
        dataType: 'json',
        data: {
          'page': this.page
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      logger.info('益智具体分类' , this.page, resp.data)
      this.longToast.hide()
      if (resp.data.res.resources.length < 20) {
        this.pageEnd = true
      }
      if (resp.data.res.resources.length == 0) {
        return
      }

      this.setData({
        playList: this.data.playList.concat(resp.data.res.resources),
        show_type: resp.data.res.resources[0].attachment_type
      })
      this.page++
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
  }),

  onReachBottom: function () {
    logger.info('分页加载', 'this.pageEnd', this.pageEnd)
    if (this.pageEnd) {
      return
    }
    if (this.data.tabId == 0) {
      return this.getTypeList('getResourse')
    }
    this.getPlayList()
  },

  playPreview: co.wrap(function* (e) {
    let index = e.currentTarget.id
    let title = this.data.playList[index].title
    let id = this.data.playList[index].sn
 
    let parentSn = this.data.typeList[this.data.tabId].sn || this.data.playList[index].category_sn
    router.navigateTo('/pages/print_doc/library_play_preview/library_play_preview', {
      title: title,
      id: id,
      sn: parentSn,
      type: '_fun'
    })
  }),

  onUnload () {
    event.remove('Authorize', this)
  }

})