/*
 * @Author: your name
 * @Date: 2019-12-05 21:00:18
 * @LastEditTime: 2019-12-06 10:26:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/pages/print_photo/mediachoose.js
 */
// pages/print_photo/mediachoose.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const _ = require('../../lib/underscore/we-underscore')
const util = require('../../utils/util')

import wxNav from '../../utils/nav.js'
Page({
  data: {

  },

  onLoad: function (options) {

  },

  choosemedia:function(e){
    wxNav.redirectTo('/pages/print_photo/photolist', {
      mediaType:e.currentTarget.dataset.type
    })
	},
	

	printPhotoDoc:function(){
		wxNav.navigateTo('/pages/print_photo_doc/index')
	},

	printId:function(){
		wxNav.navigateTo('/pages/print_id/index')
	}
})
