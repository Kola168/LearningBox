/**
 * 自定义头部导航组件
 *
 * 组件属性列表
 *
 * @param {String} backImage          back按钮的图标地址
 * @param {String} homeImage          home按钮的图标地址
 * @param {eventhandler} bindback     点击back按钮触发此事件响应函数
 * @param {eventhandler} bindBackHome 点击home按钮触发此事件响应函数
 * @param {String} title              导航标题，如果不提供为空
 * @param {String} background         导航背景色，默认#ffffff
 * @param {String} color              导航字体颜色
 * @param {Boolean} clickBackTop      是否开启双击返回顶部功能，默认true
 * @param {Object} searchObj          {搜索设置
 *                                      isSearch:false,是否是搜索
 *                                      url:'',搜索跳转路径
 *                                      textColor:'',字体颜色
 *                                      background:''背景色
 *                                      placeText:''默认占位文字
 *                                    }
 *
 * @param {Boolean} isOnlyStatusBar   只显示状态栏,默认false
 * @param {Boolean} slotLeft          左侧区域是否使用slot内容，默认false
 * @param {Boolean} slotCenter        中间区域是否使用slot内容，默认false
 *
 * Slot Name
 * left                               左侧slot，在back按钮位置显示，当left属性为true的时候有效
 * center                             标题slot，在标题位置显示，当center属性为true的时候有效
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
    showNavCapsuleBack: false,
    showNavCapsuleHome: false
  },
  properties: {
    backImage: {
      type: String,
      value: '/images/icon-back.png'
    },
    homeImage: {
      type: String,
      value: '/images/icon-home.png'
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
          "pages/index/index"
        )
      }
    }
  },
  ready() {
    let navBarInfo = (app.navBarInfo && app.navBarInfo.navBarHeight > 0) ? app.navBarInfo : app.getNavBarInfo()
    this.setData(navBarInfo)
    let pages = getCurrentPages(),
      tabBars = ['pages/main/home_index', 'pages/search/index'],
      len = pages.length,
      currentPageRoute = pages[len - 1].route,
      showNavCapsuleBack = pages.length > 1,
      showNavCapsuleHome = !tabBars.includes(currentPageRoute)
    this.setData({
      showNavCapsuleBack,
      showNavCapsuleHome
    })
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