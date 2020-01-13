const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from "../../../../utils/common_import";

import graphql from '../../../../network/graphql/subject'
Page({
  data: {
    topicType: 'single',
    topicDetail: null
  },
  onLoad: co.wrap(function* (query) {
    this.weToast = new app.weToast()
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getErrorbookDetail(query.id)
      let tempData = res.xuekewang.question,
        dataObj = {
          topicDetail: tempData,
          topicType: 'single'
        }
      if (tempData.children.length > 0) {
        dataObj.topicType = 'multiple'
      }
      this.setData(dataObj)
      this.weToast.hide()
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  })
})