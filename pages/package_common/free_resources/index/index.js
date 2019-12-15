"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
const constants = require('../../../../utils/test.js');
// 右侧每一类的 bar 的高度（固定）
const RIGHT_BAR_HEIGHT = 40;
// 左侧每个类的高度（固定）
const LEFT_ITEM_HEIGHT = 52
Page({
  data: {
    minHeight: 0,
    //右侧每3个子类的高度（固定）
    rightItemHeight: 140,
    //模拟 数据
    constants: [],
    // 左 => 右联动 右scroll-into-view 所需的id
    toViewId: null,
    // 当前左侧选择的
    currentLeftSelect: null,
    leftToTop: 0
  },
  onLoad: function () {
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
      constants: constants,
      currentLeftSelect: constants[0].id
    })
    this.eachRightItemToTop = this.getEachRightItemToTop()
  },

  // 获取每个右侧的 bar 到顶部的距离，用来做后面的计算。
  getEachRightItemToTop: function () {
    try {
      let obj = {},
        totop = 0

      // 右侧第一类肯定是到顶部的距离为 0
      obj[constants[0].id] = totop
      // 循环来计算每个子类到顶部的高度
      for (let i = 1; i < (constants.length + 1); i++) {
        let rowCount = Math.ceil(constants[i - 1].category.length / 3)
        console.log('rowCount', rowCount)
        console.log('this.data.rightItemHeight', this.data.rightItemHeight)
        totop += (RIGHT_BAR_HEIGHT + rowCount * this.data.rightItemHeight)
        console.log('totop', totop)
        // 这个的目的是 例如有两类，最后需要 0-1 1-2 2-3 的数据，所以需要一个不存在的 'last' 项，此项即为第一类加上第二类的高度。
        obj[constants[i] ? constants[i].id : 'last'] = totop
      }
      return obj
    } catch (error) {
      console.log(error)
    }

  },
  // 监听右侧的滚动事件与 eachRightItemToTop 的循环作对比 从而判断当前可视区域为第几类，从而渲染左侧的对应类。
  rightScroll: function (e) {
    for (let i = 0; i < this.data.constants.length; i++) {
      let left = this.eachRightItemToTop[this.data.constants[i].id]
      let right = this.eachRightItemToTop[this.data.constants[i + 1] ? this.data.constants[i + 1].id : 'last']
      if (e.detail.scrollTop < right && e.detail.scrollTop >= left) {
        this.setData({
          currentLeftSelect: this.data.constants[i].id,
          leftToTop: LEFT_ITEM_HEIGHT * i
        })
      }
    }
  },
  // 左侧类的点击事件，点击时，右侧会滚动到对应分类
  changeType: function (e) {
    this.setData({
      toViewId: e.target.id || e.target.dataset.id,
      currentLeftSelect: e.target.id || e.target.dataset.id
    })
  },
  toNext() {
    wxNav.navigateTo(`../content/index`)
  }
})