"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
const request = util.promisify(wx.request)
const event = require('../../../../lib/event/event')
import graphql from '../../../../network/graphql_request'
import storage from '../../../../utils/storage'
import router from '../../../../utils/nav'
Page({
  data: {
    tabId: 0,
    playWidth: 0,
    showMore: false,
    catesList: [
      {name: '全部'},
      {name: '测试0'},
      {name: '测试1'},
      {name: '测试2'},
      {name: '测试3'},
      {name: '测试3'},
      {name: '测试3'}
    ],
    playList: [
      {
        name: '测试',
        icon_url: 'https://cdn-h.gongfudou.com/Leviathan/backend/attachment/attachment/a397bfa0b9c14beb94ea73a702e5a32f.jpeg',
        sale_price: 0,
        title: '五元钱的饼干🍪',
        print_count: 20,
        total_page: 100
      },
      {
        name: '测试',
        icon_url: 'https://cdn-h.gongfudou.com/Leviathan/backend/attachment/attachment/a397bfa0b9c14beb94ea73a702e5a32f.jpeg',
        sale_price: 0,
        title: '五元钱的饼干🍪',
        print_count: 20,
        total_page: 100
      }
    ],
    allList: [],
    show_type: '', //横向列表or纵向
    showCatesModal: false,
    isAndroid: false,
    isMember: false,
    top: 0,
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    this.page = 1
    this.pageEnd = false
    let systemInfo = wx.getSystemInfoSync()
    this.setData({
      isAndroid: systemInfo.system.indexOf('iOS') > -1 ? false : true,
      top: app.navBarInfo.topBarHeight,
    })
    let unionId = storage.get('unionId')
    if (unionId) {
      yield this.loopGetOpenId()
    }
  }),
 
  // 打开分类弹窗
  openCategory: function () {
    this.setData({
      showCatesModal: true
    })
  },

  // 关闭分类弹窗
  closeCategory: function (e) {
    this.setData({
      showCatesModal: false
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
      showCatesModal: false
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
      console.log('益智列表页', this.page, resp)
      this.longToast.hide()
      if (data != 'getResourse') {
        resp.data.res.sub_category.unshift({
          name: '全部'
        })
        this.setData({
          catesList: resp.data.res.sub_category,
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
      this.longToast.toast()
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
      this.longToast.toast()

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
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  onReachBottom: function () {
    console.log('分页加载')
    console.log('this.pageEnd', this.pageEnd)
    if (this.pageEnd) {
      return
    }
    if (this.data.tabId == 0) {
      return this.getTypeList('getResourse')
    }
    this.getPlayList()
  },

  playPreview: co.wrap(function* ({currentTarget: {dataset: {index}}}) {
    let title = this.data.playList[index].title
    let id = this.data.playList[index].sn
 
    console.log(this.data.typeList[this.data.tabId])

    let categorySn = this.data.typeList[this.data.tabId].sn || this.data.playList[index].category_sn
    
    router.navigateTo('/pages/package_preschool/content_detail/content_detail', {
      title: title,
      id,
      sn: categorySn
    })
    // wx.navigateTo({
    //   url: `play_preview?title=${title}&id=${id}&sn=${categorySn}&type=_fun`
    // })

  })

})