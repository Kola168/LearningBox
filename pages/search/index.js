"use strict"

const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
import graphql from '../../network/graphql_request'

Page({
  data: {
    keyword: '',
    historySearchs: [],
    hotTags: [],
    searchResult: [],
    notResult: false,
    inputFocus: true
  },
  onLoad: co.wrap(function*() {
    wx.showLoading({
      title: "请稍等",
      mask: true
    })
    try {
      let hotTags = yield this.getHotSearch()
      let historySearchs = yield this.getHistorySearch()
      this.setData({
        hotTags,
        historySearchs
      })
      wx.hideLoading()
    } catch (error) {
      wx.hideLoading()
      util.showErr(error)
    }

  }),
  getHotSearch: co.wrap(function*() {
    try {
      let res = yield graphql.getHotSearch()
      return res.hotTags.tags
    } catch (error) {
      util.showGraphqlErr(error)
    }
  }),
  getHistorySearch: co.wrap(function*() {
    try {
      let res = yield graphql.getHistorySearch()
      return res.userSearchRecords
    } catch (error) {
      util.showGraphqlErr(error)
    }
  }),
  // 获取搜索结果
  search: co.wrap(function*(e) {
    let keyword = this.data.keyword
    if (e.currentTarget.dataset.keyword) {
      keyword = e.currentTarget.dataset.keyword
      this.setData({
        keyword,
        inputFocus: false
      })
    }
    wx.showLoading({
      title: '请稍等',
      mask: true
    })
    try {
      let keys = ["ec_contents", "features", "courses","kfb_categories"]
      let res = yield graphql.getSearchResult(keyword,keys)
      this.setData({
        searchResult: res.searchResult,
        notResult: res.searchResult.length === 0
      })
      wx.hideLoading()
    } catch (error) {
      wx.hideLoading()
      util.showGraphqlErr(error)
    }
  }),
  toSearchDetail(e) {
    let index = e.currentTarget.dataset.index,
      typeIndex = e.currentTarget.dataset.typeindex,
      tapItem = this.data.searchResult[index],
      typeItem = tapItem.resources[typeIndex],
      type = tapItem.name,
      url = ''
    if (type === 'ec_contents') {
      url = `/pages/library/play_preview?title=${typeItem.name}&id=${typeItem.sn}&sn=${typeItem.categorySn}&type=_fun`
    } else if (type === 'features') {
      url = typeItem.miniappPath
    } else if (type === 'courses') {
      url = `/pages/learning/course/course?sn=${typeItem.sn}`
    } else if (type === 'kfb_categories') {
      return this.handleJumpKfbCategories(typeItem)
    }
    wx.navigateTo({
      url: url
    })
  },

  handleJumpKfbCategories: co.wrap(function*(item) {
    console.log('path',item.path)
    try {
      let path = item.path
      switch (item.pathTypeKey) {
        //其他小程序
        case 'appid':
          let appid = path.split("-")
          let id = appid[0]
          path = decodeURIComponent(appid[1])
          wx.navigateToMiniProgram({
            appId: id,
            path: path
          })
          break
        //webview
        case 'web':
          wx.navigateTo({
            url: `/pages/webview/index?url=${path}`
          })
          break
          //内部功能
        case 'miniprogram_path':
          wx.navigateTo({
            url: path
          })
          break
          //多级分类（自有资源大于等于3级）
        case 'multi_category':
          wx.navigateTo({
            url: path + `?sn=${item.sn}`
          })
          break
          // 第三方资源列表(包括试卷等),试卷到试卷的首页再获取sn
        case 'thrid_party_resources':
          wx.navigateTo({
            url: path + `?sn=${path.substr(24)}`
          })
          break
          //小程序tab页
        case 'miniprogram_tab':
          wx.switchTab({
            url: path
          })
          break
          //自由资源详情，需带上级id
        case 'multi_category_detail':
          wx.navigateTo({
            url: path + `?title=${item.name}&sn=${item.categorySn}&id=${item.sn}&type=_fun`
          })
          break
          //第三方资源详情，需带上级id
        case 'thrid_party_resources_detail':
          wx.navigateTo({
            url: path + `?sn=${item.sn}&parent_sn=${item.categorySn}`
          })
          break
      }
    } catch (e) {
      console.log(e)
    }
  }),

  back() {
    wx.navigateBack()
  },

  input(e) {
    let tempValue = e.detail.value.trim()
    if (tempValue) {
      this.setData({
        keyword: tempValue
      })
    } else {
      this.setData({
        notResult: false,
        searchResult: []
      })
    }
  },
  deleteContent() {
    this.setData({
      keyword: '',
      searchResult: [],
      notResult: false,
      inputFocus: true
    })
  },
  deleteHistoryTag: co.wrap(function*(e) {
    let index = e.currentTarget.id,
      historySearchs = this.data.historySearchs,
      sn = null
    if (index === 'all') {
      historySearchs = []
    } else {
      sn = e.currentTarget.dataset.sn
      historySearchs.splice(index, 1)
    }
    wx.showLoading({
      title: "请稍等",
      mask: true
    })
    try {
      let res = yield graphql.deleteHistorySearch(sn)
      wx.hideLoading()
    } catch (error) {
      console.log(error)
      wx.hideLoading()
      util.showGraphqlErr(error)
    }

    this.setData({
      historySearchs
    })
  }),
  toFeedback() {
    wx.redirectTo({
      url: '/pages/account/feedback?type=search'
    })
  }
})