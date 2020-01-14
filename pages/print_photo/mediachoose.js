/*
 * @Author: your name
 * @Date: 2019-12-05 21:00:18
 * @LastEditTime : 2020-01-14 16:58:41
 * @LastEditors  : Please set LastEditors
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
    topImgList:[{
      name:'6寸照片',
      type:'pic_in6',
      iconPath:'/images/printphoto_6inch.png',
      size:'102*152mm',
      mode:true,
      bindFun:'choosemedia'
    },{
      name:'在A4纸上打印',
      type:'',
      iconPath:'/images/printphoto_a4_to_file.png',
      size:'速度快 耗墨少',
      mode:false,
      bindFun:'printPhotoDoc'
    }],
    smallImgList:[{
      name:'5寸照片',
      type:'pic_in5',
      iconPath:'/images/printphoto_5inch.png',
      size:'89*127mm',
      mode:true,
      bindFun:'choosemedia'
    },{
      name:'lomo照片',
      type:'lomo',
      iconPath:'/images/printphoto_lomo.png',
      size:'74*105mm',
      mode:true,
      bindFun:'choosemedia'
    },{
      name:'7寸照片',
      type:'pic_in7',
      iconPath:'/images/printphoto_7inch.png',
      size:'127*178mm',
      mode:false,
      bindFun:'choosemedia'
    },{
      name:'A4照片',
      type:'pic_a4',
      iconPath:'/images/printphoto_a4.png',
      size:'A4尺寸照片纸',
      mode:false,
      bindFun:'choosemedia'
    },{
      name:'证件照',
      type:'',
      iconPath:'/images/printphoto_id.png',
      size:'多尺寸可换背景',
      mode:false,
      bindFun:'printId'
    }]
  },

  onLoad: function (options) {

  },

  choosemedia:function(e){
    wxNav.navigateTo('/pages/print_photo/photolist', {
      mediaType:e.currentTarget.dataset.type,
      showMode:JSON.stringify(e.currentTarget.dataset.mode)
    })
	},


	printPhotoDoc:function(){
		wxNav.navigateTo('/pages/print_photo_doc/index')
	},

	printId:function(){
		// return wx.showModal({
		// 	title: '提示',
		// 	content: '暂未开放，敬请期待',
		// 	showCancel: false,
		// })
		wxNav.navigateTo('/pages/print_id/index')
	}
})
