// pages/package_subject/sync_learn/preview_subject/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/subject'
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

  onLoad: function (options) {
    var sn = options.sn
    this.longToast = new app.weToast()
    console.log(sn, '===sn===')
  },

  changeImg: function({detail: {current}}) {
    this.setData({
      currentIndex: current + 1
    })
    console.log(current,'current')
  },

  	/**
	 * @methods 确认
	 */
	confirm: co.wrap(function*(e) {

    if(Boolean(storage.get("hideConfirmPrintBox"))){
        return this.print()
		}

		this.setData({
				['confirmModal.isShow']: true
		})
	}),

  print: co.wrap(function*(){

  }),

  onShareAppMessage: function () {

  }
})