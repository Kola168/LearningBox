const app = getApp()
import { regeneratorRuntime, co, wxNav, util } from '../../utils/common_import'
const event = require('../../lib/event/event')
const chooseImage = util.promisify(wx.chooseImage)
const chooseMessageFile = util.promisify(wx.chooseMessageFile)

import graphql from '../../network/graphql_request'
let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

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
    baidu: {
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
    },
    fileType: {
      type: String,
      value: 'img'
    },
    docNum: {
      type: Number,
      value: 5
    }
  },
  attached: co.wrap(function*() {
    this.weToast = new app.weToast()
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    } else if (app.isFullScreen == undefined) {
      let that = this
      setTimeout(function() {
        that.setData({
          butHigh: app.isFullScreen
        })
      }, 500)
    }
  }),
  detached(){
    event.remove('chooseBaiduFileDone',this)
  },
  methods: {
    showPop: function() {
      this.setData({
        popWindow: !this.data.popWindow
      })
    },
    chooseFile(e) {
      let fileType = this.data.fileType
      if (fileType === 'img') {
        this.chooseImg(e.currentTarget.dataset.id)
      } else {
        this.chooseDoc()
      }
    },
    chooseDoc: co.wrap(function*() {
      let res = yield chooseMessageFile({
        count: this.data.docNum,
        type: 'file'
      })
      this.showPop()
      this.triggerEvent('choosedDoc', res)
    }),
    chooseImg: co.wrap(function*(type) {
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
    baiduChooseImg: co.wrap(function*() {
      try {
        this.weToast.toast({
          type: 'loading'
        })
        let res = yield graphql.getBaiduNetAuth()
        this.weToast.hide()
        if (res.token.baiduTokenName) {
          event.on('chooseBaiduFileDone', this, (baiduFiles) => {
            this.triggerEvent('baidutap', baiduFiles)
          })
          this.showPop()
          wxNav.navigateTo('/pages/package_feature/baidu_print/choose/index', {
            type: this.data.fileType
          })
        } else {
          this.showPop()
          wxNav.navigateTo('/pages/print_doc/start_intro/start_intro', {
            type: 'baiduPrint'
          })
        }
      } catch (error) {
        this.showPop()
        util.showError(error)
      }
    }),
    preventScroll: function() {},
  }
})