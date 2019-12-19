// pages/library/play.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const request = util.promisify(wx.request)
const event = require('../../../lib/event/event')
import graphql from '../../../network/graphql_request'
import api from '../../../network/restful_request'
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
    var userSn = storage.get('user_sn')

    if (userSn) {
      yield this.getTypeList()
    }
    event.on('Authorize', this, function (data) {
      this.getTypeList()
    })
  }),

  onShow: co.wrap(function* () {
    let userSn = storage.get('user_sn')
    logger.info('应用二维码参数传参', this.share_user_id, this.way)
    if (!userSn) {
      let url = this.share_user_id ? `/pages/authorize/index` : `/pages/authorize/index`
      router.navigateTo(url, this.share_user_id ? {
        url: url,
        share_user_id: this.share_user_id,
        way: this.way
      } : null)
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
      return yield this.getTypeList('getResource')
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
      const resp = yield api.getResourceCategories(this.id, {
        page: this.page
      })
      if (resp.code != 0) {
        throw (resp)
      }
      this.longToast.hide()
      var typeList = resp.res.sub_category
      if (data != "getResource") {
        typeList = [{
          name: '全部'
        }].concat(typeList)
        this.setData({
          typeList: typeList,
        })
      }
      if (resp.res.resources.length < 20) {
        this.pageEnd = true
      }
      if (resp.res.resources.length == 0) {
        return
      }
      this.setData({
        playList: this.data.playList.concat(resp.data.resources),
        show_type: resp.res.resources.length > 0 ? resp.res.resources[0].attachment_type : ''
      })
      this.page++
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
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
      const resp = yield api.getResourceCategories(this.data.typeList[this.data.tabId].sn, {
        page: this.page
      })
      if (resp.code != 0) {
        throw (resp)
      }
      logger.info('益智具体分类' , this.page, resp)
      this.longToast.hide()
      if (resp.res.resources.length < 20) {
        this.pageEnd = true
      }
      if (resp.res.resources.length == 0) {
        return
      }

      this.setData({
        playList: this.data.playList.concat(resp.res.resources),
        show_type: resp.res.resources[0].attachment_type
      })
      this.page++
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),

  onReachBottom: function () {
    if (this.pageEnd) {
      return
    }
    if (this.data.tabId == 0) {
      return this.getTypeList('getResource')
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