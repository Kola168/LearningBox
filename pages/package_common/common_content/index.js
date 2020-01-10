// pages/package_common/common_content/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage
} from '../../../utils/common_import.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_common/common_content/index')
const event = require('../../../lib/event/event')
import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'

Page({
  data: {
    allList: [],
    planList: []
  },
  onLoad: co.wrap(function* (options) {
    this.setData({
      name: options.name
    })
    this.key = options.key
    this.options = options
    this.longToast = new app.weToast()
    this.userSn = storage.get('userSn')
    if (!this.userSn) {
      return router.navigateTo('/pages/authorize/index')
    }

    yield this.getFeatureIndex()
    this.customizeFeaturePlans()
    event.on('Authorize', this, () => {
      this.userSn = storage.get('userSn')
      this.getFeatureIndex()
      this.customizeFeaturePlans()
    })
  }),
  onShow: function () {

  },
  getFeatureIndex: co.wrap(function* () {
    this.longToast.toast({
      type: "loading"
    })
    try {
      const resp = yield gql.customizeCategories(this.key)
      logger.info(resp)
      this.setData({
        allList: resp.customizeCategories
      })
      this.longToast.hide()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }

  }),
  customizeFeaturePlans: co.wrap(function* () {
    this.longToast.toast({
      type: "loading"
    })
    try {
      const resp = yield gql.customizeFeaturePlans(this.key)
      logger.info(resp)
      this.setData({
        planList: resp.customizeFeaturePlans
      })
      this.longToast.hide()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }

  }),
  joinPlan: co.wrap(function* (e) {
    router.navigateTo('/pages/package_preschool/growth_plan/checkpoint/plan_checkpoint', {
      planSn: e.currentTarget.id,
      name: e.currentTarget.dataset.name
    })

    // this.longToast.toast({
    //   type: "loading"
    // })
    // try {
    //   const resp = yield gql.joinPlan({
    //     sn: e.currentTarget.id
    //   })
    //   logger.info(resp)
    //   this.longToast.hide()
    //   yield this.customizeFeaturePlans()
    // } catch (error) {
    //   this.longToast.hide()
    //   util.showError(error)
    // }

  }),
  toNextPage(e) {
    router.navigateTo('/pages/package_common/common_content/list', {
      sn: e.currentTarget.id,
      name: e.currentTarget.dataset.name
    })
  },
  onShareAppMessage: function () {

  },
  onUnload() {
    event.remove('Authorize', this)
  },
})