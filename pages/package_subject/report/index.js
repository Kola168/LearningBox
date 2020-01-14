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
    this.mediaType = query.mediaType
    this.weToast = new app.weToast()
    let isFullScreen = app.isFullScreen
    this.mediaType = query.mediaType
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
    wxNav.navigateTo('/pages/package_common/setting/setting', {
      settingData: encodeURIComponent(JSON.stringify({
        file: {
          name: this.data.name,
        },
        orderPms: {
          printType: 'PRINTSUBJECT',
          pageCount: this.data.imgList.length,
          featureKey: 'xuekewang_report',
          mediaType: this.mediaType,
          attributes: {
            resourceType: 'XuekewangReport',
            sn: this.sn,
            originalUrl: this.printPdf,
          }
        },
        checkCapabilitys: {
          isSettingDuplex: true,
          isSettingColor: true,
        }
      }))
    })
  }
})