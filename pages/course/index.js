import {
  co,
  regeneratorRuntime
} from "../../utils/common_import"
import Logger from '../../utils/logger'
const logger = new Logger.getLogger('pages/course/index')
Page({
  onLoad: co.wrap(function () {
    logger.info('==执行了课程的相关逻辑==')
  }),

  onPullDownRefreash: function () {
  },
})