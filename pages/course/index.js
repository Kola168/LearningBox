import {
  co,
  regeneratorRuntime,
  storage
} from "../../utils/common_import"
import Logger from '../../utils/logger'
const logger = new Logger.getLogger('pages/course/index')
Page({
  data: {
    stage: null
  },
  onLoad: co.wrap(function () {
  }),
  onShow () {
    var stage = storage.get('kidStage')
    this.setData({
      stage
    })
  },

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