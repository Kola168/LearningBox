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
    
    logger.info('==执行了课程的相关逻辑==')
  }),
  onShow () {
    var stage = storage.get('kidStage')
    this.setData({
      stage
    })
  },
  
  onPullDownRefreash: function () {
  },
})