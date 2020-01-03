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
    imgList: [
      'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png',
      'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    ],
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
    }
  },

  onLoad: function (query) {
    this.paperId = query.id
    this.weToast = new app.weToast()
    console.log(this.paperId, '===sn===')
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
    console.log(current, 'current')
  },

  /**
   * @methods 确认
   */
  confirm: co.wrap(function* (e) {
    if (Boolean(storage.get("hideConfirmPrintBox"))) {
      return this.print()
    }

    this.setData({
      ['confirmModal.isShow']: true
    })
  }),

  print: co.wrap(function* () {

  }),
  getPaperDetail: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      console.log(this.paperId)
      getLoopsEvent({
        feature_key: 'xuekewang_paper',
        worker_data: {
          paper_id: this.paperId
        }
      }, (res) => {
        if (res.state === 'finished') {
          console.log(res)
          this.weToast.hide()
        }
      })
      // this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})