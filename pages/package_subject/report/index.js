const app = getApp()
import api from '../../../network/restful_request'
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../utils/common_import'
import subjectGql from '../../../network/graphql/subject'
Page({
  data: {
    isFullScreen: false,
    areaHeight: 0,
    imgList: [],
    from: '',
    name: ''
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    let isFullScreen = app.isFullScreen
    this.sn = query.sn
    this.setData({
      isFullScreen,
      from: query.from,
      areaHeight: app.sysInfo.screenHeight - app.navBarInfo.topBarHeight - (isFullScreen ? 30 : 0)
    })
    this.getResult()
  },
  getResult: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield subjectGql.getReportDetail(this.sn),
        report = res.xuekewang.report
      this.setData({
        imgList: report.images,
        name: report.name
      })
      this.printPdf = report.pdf.nameUrl
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  toMoreReport(e) {
    if (app.preventMoreTap(e)) return
    wxNav.navigateTo('../exam_paper_report/index/index')
  },
  toPrint() {
    let postData = {
      featureKey: 'xuekewang_report',
      sn: this.sn,
      name: this.data.name,
      printPdf: this.printPdf,
      pageCount: this.data.imgList.length
    }
    wxNav.navigateTo('../setting/setting', {
      postData: encodeURIComponent(JSON.stringify(postData))
    })
  }
})