// pages/package_subject/sync_learn/preview_subject/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    confirmModal: {
			isShow: false,
			title: '请正确放置A4打印纸',
			image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
		}
  },

  onLoad: function (options) {

  },

  onShow: function () {

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

  onHide: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})