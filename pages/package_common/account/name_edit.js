// pages/package_common/account/name_edit.js
const app = getApp()
import gql from '../../../network/graphql_request.js'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import {
  co,
  util
} from '../../../utils/common_import.js'
import regeneratorRuntime from '../../../lib/co/runtime'

Page({
  data: {
    name: ''
  },
  onLoad: function (options) {
    this.longToast = new app.weToast()
  },
  input: function (e) {
    logger.info(e)
    let name = e.detail.value.trim()

    if (name) {
      this.setData({
        name
      })
    }
  },
  complete: co.wrap(function* () {
    if (this.data.name.trim().length == 0) {
      return wx.showModal({
        title: '温馨提示',
        content: '您还没有输入内容哦'
      })
    }
    if (this.data.name.trim().length > 5) {
      return wx.showModal({
        title: '温馨提示',
        content: '最多输入5个字哦'
      })
    }
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    let params = {
      kidAttributes: {
        name: this.data.name,
      }
    }
    logger.info(params)
    // return
    try {
      const resp = yield gql.changeStage(params)
      logger.info(resp)
      this.longToast.hide()
      router.navigateBack()
    } catch (e) {
      util.showError(e)
      this.longToast.hide()
    }

  })
})