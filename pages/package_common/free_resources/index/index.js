"use strict"
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/common.js'
// 右侧每一类的 bar 的高度（固定）
const RIGHT_BAR_HEIGHT = 40;
// 左侧每个类的高度（固定）
const LEFT_ITEM_HEIGHT = 52
Page({
  data: {
    minHeight: 0,
    //右侧每3个子类的高度（固定）
    rightItemHeight: 140,
    //数据
    constants: [],
    allData: [],
    // 左 => 右联动 右scroll-into-view 所需的id
    toViewId: null,
    // 当前左侧选择的
    currentLeftSelect: 'id0',
    leftToTop: 0
  },
  onLoad: co.wrap(function* () {
    this.weTosat = new app.weToast()
    // 右侧每类数据到顶部的距离（用来与 右 => 左 联动时监听右侧滚动到顶部的距离比较）
    this.eachRightItemToTop = []
    let screenWidth = app.sysInfo.screenWidth,
      rightItemHeight = 140
    if (screenWidth < 340) {
      rightItemHeight = 110
    } else if (screenWidth >= 410) {
      rightItemHeight = 150
    }
    this.setData({
      minHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight,
      rightItemHeight,
    })
    this.getFreeSources()
  }),

  // 获取免费资源
  getFreeSources: co.wrap(function* () {
    this.weTosat.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getFreeSources('free_resource'),
        allData = res.feature.categories
      this.weTosat.hide()
      if (allData.length > 0) {
        for (let i = 0; i < allData.length; i++) {
          allData[i].id = 'id' + i
        }
        this.setData({
          allData,
          currentLeftSelect: allData[0].id
        })
        this.eachRightItemToTop = this.getEachRightItemToTop()
      } else {
        wx.showToast({
          title: '暂无数据',
          icon: 'none'
        })
      }
    } catch (error) {
      this.weTosat.hide()
      util.showError(error)
    }
  }),

  // 获取每个右侧的 bar 到顶部的距离，用来做后面的计算。
  getEachRightItemToTop: function () {
    try {
      let obj = {},
        totop = 0,
        allData = this.data.allData

      // 右侧第一类肯定是到顶部的距离为 0
      obj[allData[0].id] = totop
      // 循环来计算每个子类到顶部的高度
      for (let i = 0; i < allData.length; i++) {
        let rowCount = Math.ceil(allData[i].children.length / 3)
        totop += (RIGHT_BAR_HEIGHT + rowCount * this.data.rightItemHeight)
        // 这个的目的是 例如有两类，最后需要 0-1 1-2 2-3 的数据，所以需要一个不存在的 'last' 项，此项即为第一类加上第二类的高度。
        obj[allData[i + 1] ? allData[i + 1].id : 'last'] = totop
      }
      return obj
    } catch (error) {
      console.log(error)
    }
  },
  // 监听右侧的滚动事件与 eachRightItemToTop 的循环作对比 从而判断当前可视区域为第几类，从而渲染左侧的对应类。
  rightScroll: function (e) {
    for (let i = 0; i < this.data.allData.length; i++) {
      let tempId = this.data.allData[i].id,
        tempNextId = this.data.allData[i + 1],
        left = this.eachRightItemToTop[tempId],
        right = this.eachRightItemToTop[tempNextId ? tempNextId.id : 'last']
      if (e.detail.scrollTop < right && e.detail.scrollTop >= left) {
        if (this.data.currentLeftSelect === tempId) return
        this.setData({
          currentLeftSelect: this.data.allData[i].id,
          leftToTop: LEFT_ITEM_HEIGHT * i
        })
      }
    }
  },

  // 左侧类的点击事件，点击时，右侧会滚动到对应分类
  changeType: function (e) {
    let id = e.currentTarget.dataset.id
    this.setData({
      toViewId: id,
      currentLeftSelect: id
    })
  },
  toNext(e) {
    let sn = e.currentTarget.dataset.sn
    wxNav.navigateTo(`../content/index`, {
      sn: sn
    })
  }
})