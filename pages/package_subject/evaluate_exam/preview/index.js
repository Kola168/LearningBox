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
    this.setData({
      hasReport: Boolean(Number(query.hasReport)),
      name: query.name
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
    console.log({
      featureKey: 'xuekewang_paper',
      sn: this.paperId,
      name: this.data.name,
      isPrintAnswer: this.data.printAnswer,
      pageCount: this.imgList.length
    })
    wxNav.navigateTo('../../setting/index', {
      featureKey: 'xuekewang_paper',
      sn: this.sn,
      isPrintAnswer: this.data.printAnswer
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
          paper_id: this.paperId
        }
      }, (res) => {
        if (res.data.state === 'finished') {
          this.setData({
            imgList: res.data.images
          })
          this.sn = res.data.sn
          this.weToast.hide()
        }
      })
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})