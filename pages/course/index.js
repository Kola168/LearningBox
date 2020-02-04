var app = getApp()
import {
  co,
  regeneratorRuntime,
  storage,
  util
} from "../../utils/common_import"
import Logger from '../../utils/logger'
const logger = new Logger.getLogger('pages/course/index')
import gql from '../../network/graphql_request'
Page({
  data: {
    stage: null
  },
  onLoad: co.wrap(function *() {
    this.longToast = new app.weToast()
  }),
  onShow: co.wrap(function*() {
    var user = yield this.getUserInfo()
    this.setData({
      stage: user.selectedKid.stageRoot.rootKey
    })
  }),

  /**
   * 获取用户信息
   */
  getUserInfo: co.wrap(function*() {
		if(app.isScope()){
      this.longToast.toast({
        type: 'loading',
        title: '请稍后'
      })
			try {
        let resp = yield gql.getUser()
				storage.put("userSn", resp.currentUser.sn)
				storage.put("kidStage", resp.currentUser.selectedKid.stageRoot.rootKey)
				return resp.currentUser
			} catch (e) {
				// util.showError(e)
			} finally {
        this.longToast.hide()
      }
		}
    
  }),

  onHide(){
    this.setData({
      stage: null
    })
  },

  onUnload(){
    this.setData({
      stage: null
    })
  },

  onShareAppMessage () {
    var share = this.data.stage == 'preschool' ? {
      title: '小白老师邀你一起体验这款学习神器',
      path: '/pages/index/index'
    } : {
      title: '海量精品学习资料全免费！还不快看看',
      path: '/pages/index/index'
    }
    return share
  },

  onPullDownRefreash: function () {
  },
})