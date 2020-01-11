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
    console.log(res)
  })
})