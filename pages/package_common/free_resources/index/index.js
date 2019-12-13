"use strict"
const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'
// Page({
//   minHeight: 0,
//   onLoad() {
//     this.setData({
//       minHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight
//     })
//   },
//   toNext(){
//     wxNav.navigateTo(`../content/index`)
//   }
// })

const constants = require('../../../../utils/test.js');
// 右侧每一类的 bar 的高度（固定）
const RIGHT_BAR_HEIGHT = 20;
// 右侧每个子类的高度（固定）
const RIGHT_ITEM_HEIGHT = 100;
// 左侧每个类的高度（固定）
const LEFT_ITEM_HEIGHT = 52

Page({
  data: {
    minHeight: 0,
    //swiper滑动的数组
    HZL_swiper_ID: 0,

    //模拟 数据
    constants: [],
    // 左 => 右联动 右scroll-into-view 所需的id
    HZL_toView: null,
    // 当前左侧选择的
    HZL_currentLeftSelect: null,
    // 右侧每类数据到顶部的距离（用来与 右 => 左 联动时监听右侧滚动到顶部的距离比较）
    HZL_eachRightItemToTop: [],
    HZL_leftToTop: 0
  },
  onLoad: function() {
    setTimeout(() => {
      this.setData({
        minHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight
      })
    }, 500)

    this.setData({
      constants: constants,
      HZL_currentLeftSelect: constants[0].id
    })
    this.HZL_eachRightItemToTop = this.HZL_getEachRightItemToTop()
  },
  //记录swiper滚动的
  HZL_swiperchange: function(e) {
    this.setData({
      HZL_swiper_ID: e.detail.current,
    })
  },

  // 获取每个右侧的 bar 到顶部的距离，用来做后面的计算。
  HZL_getEachRightItemToTop: function() {
    let obj = {},
      totop = 0

    // 右侧第一类肯定是到顶部的距离为 0
    obj[constants[0].id] = totop
      // 循环来计算每个子类到顶部的高度
    for (let i = 1; i < (constants.length + 1); i++) {
      totop += (RIGHT_BAR_HEIGHT + constants[i - 1].category.length * RIGHT_ITEM_HEIGHT)
        // 这个的目的是 例如有两类，最后需要 0-1 1-2 2-3 的数据，所以需要一个不存在的 'last' 项，此项即为第一类加上第二类的高度。
      obj[constants[i] ? constants[i].id : 'last'] = totop
    }
    return obj
  },
  // 监听右侧的滚动事件与 HZL_eachRightItemToTop 的循环作对比 从而判断当前可视区域为第几类，从而渲染左侧的对应类。
  right: function(e) {
    for (let i = 0; i < this.data.constants.length; i++) {
      let left = this.HZL_eachRightItemToTop[this.data.constants[i].id]
      let right = this.HZL_eachRightItemToTop[this.data.constants[i + 1] ? this.data.constants[i + 1].id : 'last']
      if (e.detail.scrollTop < right && e.detail.scrollTop >= left) {
        this.setData({
          HZL_currentLeftSelect: this.data.constants[i].id,
          HZL_leftToTop: LEFT_ITEM_HEIGHT * i
        })
      }
    }
  },
  // 左侧类的点击事件，点击时，右侧会滚动到对应分类
  left: function(e) {
    this.setData({
      HZL_toView: e.target.id || e.target.dataset.id,
      HZL_currentLeftSelect: e.target.id || e.target.dataset.id
    })
  }
})