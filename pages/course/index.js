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
    try {
      let resp = yield gql.getUser()
			storage.put("userSn", resp.currentUser.sn)
			storage.put("kidStage", resp.currentUser.selectedKid.stageRoot.rootKey)
      return resp.currentUser
    } catch (e) {
      util.showError(e)
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
  onPullDownRefreash: function () {
  },
})