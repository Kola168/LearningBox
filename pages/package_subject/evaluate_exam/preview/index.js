const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
import subjectGql from '../../../../network/graphql/subject'
import getLoopsEvent from '../../../../utils/worker'

Page({
  data: {
    currentIndex: 1,
    hasReport: false,
    printAnswer: false,
    title: '',
    imgList: [],
    isFullScreen: false,
    modalObj: {
      isShow: false,
      slotBottom: true,
      title: '开通学科会员 可使用海量优质试卷',
      image: 'https://cdn-h.gongfudou.com/LearningBox/subject/toast_testpaper.png'
    }
  },

  onLoad: co.wrap(function* (query) {
    this.weToast = new app.weToast()
    this.paperId = query.id
    this.subjectSn = query.subjectSn
    this.sn = query.sn != 'null' ? query.sn : ''
    this.setData({
      hasReport: Boolean(Number(query.hasReport)),
      title: query.name,
      isFullScreen: app.isFullScreen
    })
    yield this.getSubjectMemberInfo()
  }),

  changeImg: function ({
    detail: {
      current
    }
  }) {
    this.setData({
      currentIndex: current + 1
    })
  },

  checkAnswer() {
    let images = this.data.printAnswer ? this.originalImages : this.answerImages
    this.setData({
      printAnswer: !this.data.printAnswer,
      imgList: images
    })
  },

  prePrint() {
    // if (this.isMember) {
      let postData = {
        featureKey: 'xuekewang_paper',
        sn: this.sn,
        name: this.data.title,
        pageCount: this.data.imgList.length,
        printPdf: this.data.printAnswer ? this.Pdf : this.answerPdf
      }
      wxNav.navigateTo('../../setting/setting', {
        postData: encodeURIComponent(JSON.stringify(postData))
      })
    // } else {
    //   this.setData({
    //     ['modalObj.isShow']: true
    //   })
    // }
  },

  confirmModal: co.wrap(function* () {
    wxNav.navigateTo('/pages/package_member/member/index')
  }),

  getSubjectMemberInfo: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield subjectGql.getSubjectMemberInfo()
      this.isMember = res.currentUser.isSchoolAgeMember
      if (this.sn) {
        this.getPaperDetail()
      } else {
        this.loopGetImages()
      }
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

  // 获取试卷预览
  getPaperDetail: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield subjectGql.getPaperDetail(this.sn),
      paper = res.xuekewang.paper
      this.originalImages = paper.images
      this.answerImages = paper.answerImages
      this.pdf = paper.pdf.nameUrl
      this.answerPdf = paper.answerPdf.nameUrl
      this.setData({
        imgList: this.originalImages
      })
      this.weToast.hide()
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

  // 第一次生成试卷
  loopGetImages() {
    this.weToast.toast({
      type: 'loading'
    })
    getLoopsEvent({
      feature_key: 'xuekewang_paper',
      worker_data: {
        paper_id: this.paperId,
        subject_sn: this.subjectSn
      }
    }, (res) => {
      if (res.status === 'finished') {
        this.weToast.hide()
        this.sn = res.data.sn
        this.getPaperDetail()
      }
    }, (error) => {
      this.weToast.hide()
      util.showError(error)
    })
  }
})