const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
} from "../../../../utils/common_import";
import subjectGql from '../../../../network/graphql/subject'

Page({
  data: {

  },
  onLoad: co.wrap(function* (query) {
    this.weToast = new app.weToast()
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield subjectGql.getKnowledgesAtlas(Number(query.subjectId))
      this.setData({
        knowledgeList: res.xuekewang.kpointRate
      })
      console.log(res)
      this.weToast.hide()
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  })
})