"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../utils/common_import'
import graphql from '../../../network/graphql/common'

Page({
  data: {
    keyword: '',
    userSearchRecords: [],
    searchHotTags: [],
    searchResult: [],
    notResult: false,
    inputFocus: true,
    searchClue: '',
    modalObj: {
      isShow: true,
      hasCancel: false,
      content: '请您先切换该学段哦!',
      confirmText: '立即切换学段',
      image: '/images/home/device_tip.png'
    },
  },
  onLoad: co.wrap(function* () {
    this.weToast = new app.weToast()
    this.getHistoryConfig()
  }),
  getHistoryConfig: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getSearchConfig()
      this.weToast.hide()
      this.setData({
        userSearchRecords: res.currentUser.userSearchRecords,
        searchClue: res.systemConfig.searchClue,
        searchHotTags: res.systemConfig.searchHotTags
      })
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 获取搜索结果
  getSearchResult: co.wrap(function* (e) {
    let keyword = this.data.keyword
    if (e && e.currentTarget.dataset.keyword) {
      keyword = e.currentTarget.dataset.keyword
      this.setData({
        keyword,
        inputFocus: false
      })
    }
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getSearchResult(keyword)
      this.setData({
        searchResult: res.search,
        notResult: res.search.length === 0
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  toSearchDetail(e) {
    let index = e.currentTarget.dataset.index,
      typeIndex = e.currentTarget.dataset.typeindex,
      tapItem = this.data.searchResult[index],
      typeItem = tapItem.resources[typeIndex],
      type = tapItem.name,
      url = '',
      params = {}
    if (type === 'feature') {
      url = typeItem.redirectPath
      params.key = typeItem.key
    } else if (type === 'course') {
      url = `/pages/package_course/course/course`
      params.sn = typeItem.sn
    } else if (type === 'category') {
      url = typeItem.redirectPath
      params.sn = typeItem.sn
      params.title = typeItem.name
    }
    wxNav.navigateTo(url, params)
  },

  // handleJumpKfbCategories: co.wrap(function* (item) {
  //   console.log('path', item.path)
  //   try {
  //     let path = item.path
  //     switch (item.pathTypeKey) {
  //       //其他小程序
  //       case 'appid':
  //         let appid = path.split("-")
  //         let id = appid[0]
  //         path = decodeURIComponent(appid[1])
  //         wx.navigateToMiniProgram({
  //           appId: id,
  //           path: path
  //         })
  //         break
  //         //webview
  //       case 'web':
  //         wx.navigateTo({
  //           url: `/pages/webview/index?url=${path}`
  //         })
  //         break
  //         //内部功能
  //       case 'miniprogram_path':
  //         wx.navigateTo({
  //           url: path
  //         })
  //         break
  //         //多级分类（自有资源大于等于3级）
  //       case 'multi_category':
  //         wx.navigateTo({
  //           url: path + `?sn=${item.sn}`
  //         })
  //         break
  //         // 第三方资源列表(包括试卷等),试卷到试卷的首页再获取sn
  //       case 'thrid_party_resources':
  //         wx.navigateTo({
  //           url: path + `?sn=${path.substr(24)}`
  //         })
  //         break
  //         //小程序tab页
  //       case 'miniprogram_tab':
  //         wx.switchTab({
  //           url: path
  //         })
  //         break
  //         //自由资源详情，需带上级id
  //       case 'multi_category_detail':
  //         wx.navigateTo({
  //           url: path + `?title=${item.name}&sn=${item.categorySn}&id=${item.sn}&type=_fun`
  //         })
  //         break
  //         //第三方资源详情，需带上级id
  //       case 'thrid_party_resources_detail':
  //         wx.navigateTo({
  //           url: path + `?sn=${item.sn}&parent_sn=${item.categorySn}`
  //         })
  //         break
  //     }
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }),

  back() {
    wxNav.navigateBack()
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
  deleteHistoryTag: co.wrap(function* (e) {
    let index = e.currentTarget.id,
      userSearchRecords = this.data.userSearchRecords,
      sn = null
    if (index === 'all') {
      userSearchRecords = []
    } else {
      sn = e.currentTarget.dataset.sn
      userSearchRecords.splice(index, 1)
    }
    this.weToast.toast({
      type: 'loading'
    })
    try {
      yield graphql.deleteHistorySearch(sn)
      this.weToast.hide()
      this.setData({
        userSearchRecords
      })
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  changeStage(){

  },
  toFeedback() {
    wxNav.navigateTo('../feedback/index', {
      type: "search"
    })
  }
})