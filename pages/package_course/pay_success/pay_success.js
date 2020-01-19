// pages/error_book/pages/course/pay_success/pay_success.js
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../utils/common_import'
import link from './link'
import gql from '../../../network/graphql_request'
var app = getApp()
Page({
  data: {
    btnList: null
  },
  onLoad: co.wrap(function *(options) {
    var tag = options.tag
    var current = link[tag]
    if (tag) {
      yield this.getUserInfo()
      current.initParams.call(current, options) // 初始化按钮组
      current.initIndexPath.call(current, this.data.stage) // 初始化按钮组
      this.setData({
        btnList: current.btnList
      })
    }

  }),

    /**
   * 获取用户信息
   */
  getUserInfo: co.wrap(function*() {
		if(app.isScope()){
			try {
        let resp = yield gql.getUser()
        this.setData({
          stage: resp.currentUser.selectedKid.stageRoot.rootKey
        })
			} catch (e) {
				util.showError(e)
			}
		}
    
  }),

  routerUrl: function({currentTarget: {dataset: {url, params, key}}}) {
    var typeMapping = {
      switchTab: wxNav.switchTab,
      navigateTo: wxNav.navigateTo,
      redirect: wxNav.redirectTo
    }
    var router = typeMapping[key]
    key == 'switchTab' ? router(url) : router(url, params)
  } 
})