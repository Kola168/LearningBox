const app = getApp()
import api from '../../../network/restful_request'
import {
  regeneratorRuntime,
  co,
  util
} from '../../../utils/common_import'
Page({
  data: {
    isFullScreen: false,
    areaHeight: 0,
    imgList: [],
    from: ''
  },
  onLoad(query) {
    let isFullScreen = app.isFullScreen
    this.sn = query.sn
    this.setData({
      isFullScreen,
      from: query.from,
      areaHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight - (isFullScreen ? 30 : 0)
    })
    this.getResult()
  },
  getResult: co.wrap(function* () {
    try {
      // let res = yield api.synthesisSnResult(this.sn)
      console.log(res)
    } catch (error) {
      util.showError(error)
    }
  })
})