// pages/print_photo/photolist.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const _ = require('../../lib/underscore/we-underscore')
const util = require('../../utils/util')
const upload=require('../../utils/upload')

import wxNav from '../../utils/nav.js'
Page({


  //介质信息
  mediaInfo: {
    _6inch: {
      name: '6寸照片',
      size: {
        width: 1300,
        height: 1950,
        shrinksize: '/resize,m_fill,h_300,w_200/quality,Q_85/format,jpg',
      }
    },
    _5inch: {
      name: '5寸照片',
      size: {
        width: 1092,
        height: 1560,
        shrinksize: '/resize,m_fill,h_285,w_200/quality,Q_85/format,jpg',
      }
    },
    _7inch: {
      name: '7寸照片',
      size: {
        width: 1560,
        height: 2148,
        shrinksize: '/resize,m_fill,h_280,w_200/quality,Q_85/format,jpg',
      }
    },
    _a4: {
      name: '7寸照片',
      size: {
        width: 2520,
        height: 3564,
        shrinksize: '/resize,m_fill,h_282,w_200/quality,Q_85/format,jpg',
      }
    },
    lomo: {
      name: 'lomo照片',
      size: {
        width: 874,
        height: 1240,
        shrinksize: '/resize,m_fill,h_310,w_219/quality,Q_85/format,jpg',
      }
    }
  },

  data: {
    photoMedia: {},
    photoList: [], //照片列表
    mediaInfo: {}, //尺寸信息
    limitPhoto: 18, //照片限制张数
    addBoxHeight: 0, //最后添加图片方块高度
    completeCount: 0, //单次上传目标个数
    count: 0, //单次上传总个数
    percent: 0, //单次上传进度条进程

  },

  onLoad: function(options) {
    this.mediaType = options.mediaType
    this.setData({
      photoMedia: this.mediaInfo[this.mediaType]
    })
    this.initSingleArea()
  },

  showImgCheck: function() {
    let restCount = this.data.limitPhoto - this.data.photoList.length
    let count = restCount > 9 ? 9 : restCount
    this.setData({
      count: count
    })
    this.selectComponent("#checkComponent").showPop()
  },

  chooseImgs: co.wrap(function*(e) {
    let imgs = e.detail.tempFiles
    let that = this
    let paths = []
    //去除大于20兆的
    _.each(imgs, function(value, index) {
      if (data.size < 20000000) {
        paths.push(value.path)
      }
    })
    //没有可用图片列表时提示
    if (paths.length == 0) {
      this.setData({
        showProcess: true,
        completeCount: '已为您过滤部分不适合打印的照片（大于20M)'
      })
      setTimeout(function() {
        that.setData({
          showInterceptModal: '',
          showProcess: false,
        })
      }, 5000)
    }else{
      this.setData({
        showProcess: true,
        count:paths.length
      })
      app.cancelUpload = false
      upload.uploadFiles(paths,function(){

      },function(process){
        that.setData({
          percent:process
        })
      })
    }

  }),

  baiduprint: function() {

  },

  //多张照片上传
  uploadImg: co.wrap(function*() {

  }),

  //取消照片上传
  cancelImg: co.wrap(function*() {

  }),

  //计算最后添加照片的高度
  initSingleArea: function() {
    try {
      let width = 340
      let height = width / this.data.photoMedia.size.width * this.data.photoMedia.size.height + 60
      this.setData({
        addBoxHeight: height
      })
    } catch (e) {
      console.log(e)
    }
  },
})
