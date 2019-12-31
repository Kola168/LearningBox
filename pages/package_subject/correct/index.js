const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from "../../../utils/common_import"
import api from '../../../network/restful_request'
Page({
  data: {
    isSubjectMember: true,
    areaHeight: 0,
    showSerial: false,
    isFullScreen: false,
    currentTopic: null,
    loadReady: false
  },
  onLoad(query) {
    let areaHeight = 0
    if (app.navBarInfo) {
      areaHeight = app.sysInfo.screenHeight - app.navBarInfo.topBarHeight
    } else {
      areaHeight = app.sysInfo.screenHeight - app.getNavBarInfo().topBarHeight
    }
    this.setData({
      areaHeight,
      isFullScreen: app.isFullScreen
    })
    this.weToast = new app.weToast()
    let scene = query.scene
    this.sn = scene.split('_')[1]
    this.getCorrectPaper()
  },
  unfoldSerial() {
    this.setData({
      showSerial: !this.data.showSerial
    })
  },
  getCorrectPaper: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield api.getCorrectPaper('9299405338858541', 'XuekewangExercise')
      if (res.code != 0) {
        throw (res)
      }
      this.topics = res.res
      let currentTopic = this.topics[1],
        options = currentTopic.option
      if (options != null) {
        let tempArr = [],
          forObj = Object.keys(options)
        for (let i = 0; i < forObj.length; i++) {
          let itemArr = [forObj[i], options[forObj[i]]]
          tempArr.push(itemArr)
        }
        currentTopic.option = tempArr
      }
      currentTopic.quesParse = currentTopic.quesParse.replace('<seg', '<span').replace('</seg>', '')

      this.setData({
        loadReady: true,
        currentTopic
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})