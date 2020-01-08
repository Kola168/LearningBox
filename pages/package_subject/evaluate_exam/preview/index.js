const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
import getLoopsEvent from '../../../../utils/worker'

Page({
  data: {
    currentIndex: 1,
    hasReport: false,
    printAnswer: false,
    imgList: [],
    isFullScreen: false,
    modalObj: {
      isShow: false,
      slotBottom: true,
      title: '开通学科会员 可使用海量优质试卷',
      image: 'https://micro.obs.cn-east-2.myhuaweicloud.com/LearningBox/subject/toast_testpaper.png'
    }
  },

  onLoad: function (query) {
    this.weToast = new app.weToast()
    this.paperId = query.id
    this.subjectSn = query.sn
    this.setData({
      hasReport: Boolean(Number(query.hasReport)),
      name: query.name,
      isFullScreen: app.isFullScreen
    })
    this.getPaperDetail()
  },

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
    this.setData({
      printAnswer: !this.data.printAnswer
    })
  },
  checkMember() {
    this.setData({
      ['modalObj.isShow']: true
    })
  },
  toPrint: co.wrap(function* () {
    let postData = {
      featureKey: 'xuekewang_paper',
      sn: this.paperId,
      name: this.data.name,
      isPrintAnswer: this.data.printAnswer,
      pageCount: this.data.imgList.length
    }
    wxNav.navigateTo('../../setting/setting', {
      postData: encodeURIComponent(JSON.stringify(postData))
    })
  }),
  getPaperDetail: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      getLoopsEvent({
        feature_key: 'xuekewang_paper',
        worker_data: {
          paper_id: this.paperId,
          subject_sn: this.subjectSn
        }
      }, (res) => {
        if (res.status === 'finished') {
          this.setData({
            imgList: res.data.images
          })
          this.sn = res.data.sn
          this.weToast.hide()
        }
      },(error)=>{
        this.weToast.hide()
        util.showError(error)
      })
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})