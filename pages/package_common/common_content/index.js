// pages/package_common/common_content/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

Page({
  data: {

  },
  /** 
   * further_key
   * title
   */
  onLoad: co.wrap(function* (options) {

  }),
  onShow: function () {

  },
  onShareAppMessage: function () {

  }
})