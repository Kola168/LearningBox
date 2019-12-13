// pages/package_common/account/name_edit.js
const app = getApp()
import gql from '../../../network/graphql_request.js'
import api from '../../../network/restful_request.js'
import router from '../../../utils/nav'
const getImageInfo = util.promisify(wx.getImageInfo)
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

  },
  input:function (e) {
    console.log(e)
    let name = e.detail.value.trim()
   
    if (name) {
      this.setData({
        name
      })
    }
  },
})