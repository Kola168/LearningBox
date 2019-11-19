/**
 * 自定义头部导航组件
 *
 * 组件属性列表
 * backImage      {string}	back按钮的图标地址
 * homeImage      {string}	home按钮的图标地址
 * bindback	      {eventhandler}	点击back按钮触发此事件响应函数
 * bindBackHome   {eventhandler}	点击home按钮触发此事件响应函数
 * title	        {string}	导航标题，如果不提供为空
 * background	    {string}	导航背景色，默认#ffffff
 * color	        {string}	导航字体颜色
 * clickBackTop   {boolean}	是否开启双击返回顶部功能，默认true
 * searchObj      {	搜索设置
 *  isSearch:false,	是否是搜索
 *  url:'',	搜索跳转路径
 *  textColor:'',	字体颜色
 *  background:''	背景色
 *  placeText:''	默认占位文字
 * }
 *
 * isOnlyStatusBar{boolean}	只显示状态栏，默认false
 * slotLeft	      {boolean}	左侧区域是否使用slot内容，默认false
 * slotCenter	    {boolean}	中间区域是否使用slot内容，默认false
 *
 * Slot Name
 * left	          左侧slot，在back按钮位置显示，当left属性为true的时候有效
 * center	        标题slot，在标题位置显示，当center属性为true的时候有效
 *
 */
import wxNav from '../../utils/nav.js'
const app = getApp()
Component({
  options: {
    multipleSlots: true
  },
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    titleWidth: 0,
    navBarPadding: 0,
    menuWidth: 0,
    menuHeight: 0,
    showBack: false
  },
  properties: {
    backImage: {
      type: String,
      value: '/images/preview-turn-left.png'
    },
    homeImage: {
      type: String,
      value: '/images/icon-home-blue.png'
    },
    isOnlyStatusBar: {
      type: Boolean,
      value: false
    },
    slotLeft: {
      type: Boolean,
      value: false
    },
    slotCenter: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '小白智慧打印'
    },
    background: {
      type: String,
      value: '#ffffff'
    },
    color: {
      type: String,
      value: '#000000'
    },
    clickBackTop: {
      type: Boolean,
      value: true
    },
    searchObj: {
      type: Object,
      value: {
        isSearch: false,
        url: '',
        placeText: '',
        textColor: '',
        background: ''
      }
    },
    bindBack: {
      type: Function,
      value: () => {
        wxNav.navigateBack()
      }
    },
    bindBackHome: {
      type: Function,
      value: () => {
        wxNav.switchTab(
          "/pages/index/index"
        )
      }
    }
  },
  ready() {
    let navBarInfo = app.navBarInfo ? app.navBarInfo : app.getNavBarInfo()
    this.setData(navBarInfo)
    let pages = getCurrentPages(),
    isShare = pages.length === 1 && pages[0].route !== 'pages/index/index'
    if (pages.length > 1 || isShare) {
      this.setData({ showBack: true })
    }
  },
  methods: {
    backTop() {
      wx.pageScrollTo({
        scrollTop: 0
      })
    },
    switchIndex() {
      this.data.bindBackHome()
    },
    navigateBack() {
      this.data.bindBack()
    },
    toSearch() {
      let url = this.data.searchObj.url
      url && wxNav.navigateTo(
        this.data.searchObj.url
      )
    }
  }
})