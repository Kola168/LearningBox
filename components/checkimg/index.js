// pages/gallery/component/checkimg/index.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')

const chooseImage = util.promisify(wx.chooseImage)
const chooseMessageFile = util.promisify(wx.chooseMessageFile)
Component({

  data: {
    popWindow: false, //显示弹窗
    showCamera: true, //显示相机选择框
    showAlbum: true, //显示手机相册选择框
    showMessageFile: true, //显示微信聊天记录选择框
    showBaidu: true, //显示百度网盘
    original: true, //是否选择原图
    compressed: true, //是否选择压缩图
    chooseImgNum: 9, //选择照片数量,
    butHigh: false, //是否需要抬高底部按钮
  },
  properties: {

    camera: {
      type: Boolean,
      value: true,
      observer: function(newval) {
        this.setData({
          showCamera: newval
        })
      }
    },
    album: {
      type: Boolean,
      value: true,
      observer: function(newval) {
        this.setData({
          showAlbum: newval
        })
      }
    },
    original: {
      type: Boolean,
      value: true,
      observer: function(newval) {
        this.setData({
          original: newval
        })
      }
    },
    compressed: {
      type: Boolean,
      value: true,
      observer: function(newval) {
        this.setData({
          compressed: newval
        })
      }
    },
    messageFile: {
      type: Boolean,
      value: true,
      observer: function(newval) {
        this.setData({
          showMessageFile: newval
        })
      }
    },
    baudu: {
      type: Boolean,
      value: true,
      observer: function(newval) {
        this.setData({
          showBaidu: newval
        })
      }
    },
    imgNum: {
      type: Number,
      value: 9,
      observer: function(newval) {
        this.setData({
          chooseImgNum: newval
        })
      }
    }
  },
  attached: co.wrap(function*() {
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    }else if(app.isFullScreen==undefined){
      let that=this
      setTimeout(function(){
        that.setData({
          butHigh: app.isFullScreen
        })
      },500)

    }
  }),
  methods: {

    showPop: function() {
      this.setData({
        popWindow: !this.data.popWindow
      })
    },
    chooseImg: co.wrap(function*(e) {
      let type = e.currentTarget.dataset.id
      let sizeType = []
      if (this.data.original) {
        sizeType.push('original')
      }
      if (this.data.compressed) {
        sizeType.push('compressed')
      }
      if (sizeType == []) {
        sizeType = ['original', 'compressed']
      }
      console.log('sizeType======', sizeType)
      console.log('chooseImgNum=====', this.data.chooseImgNum)
      let imageUrl
      if (type == 'chooseMessageFile') {
        imageUrl = yield chooseMessageFile({
          count: this.data.chooseImgNum,
          type: 'image',
        })
      } else {
        imageUrl = yield chooseImage({
          count: this.data.chooseImgNum,
          sizeType: sizeType,
          sourceType: [type]
        })
      }
      this.showPop()
      imageUrl.choosePath = type
      this.triggerEvent('chooseImg', imageUrl)
    }),
    baiduChooseImg: function() {
      this.triggerEvent('baidutap')
      this.showPop()
    },
    preventScroll: function() {},
  }
})
