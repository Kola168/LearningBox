// pages/package_feature/print_sticker/imglist.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const imginit = require('../../../utils/imginit')
const upload = require('../../../utils/upload')

const event = require('../../../lib/event/event')

const showModal = util.promisify(wx.showModal)

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({
  data: {
    modeSize: {
      two: {
        vertical: {
          width: 567,
          height: 827,
          h_num: 2,
          v_num: 1
        },
        horizontal: {
          width: 827,
          height: 567,
          h_num: 1,
          v_num: 2
        },
      },
      four: {
        vertical: {
          width: 567,
          height: 827,
          h_num: 2,
          v_num: 2
        },
        horizontal: {
          width: 827,
          height: 567,
          h_num: 2,
          v_num: 2
        },
      }
    },
    direction: 'vertical',
    type: null, //选中的类型
    imgArr: {
      vertical: {
        width: 0,
        height: 0,
        imgs: [],
      },
      horizontal: {
        width: 0,
        height: 0,
        imgs: [],
      },
    },

  },
  checkedIndex: 0,
  onLoad: function(options) {
    this.setData({
      type: options.type
    })
    this.modeSize = this.data.modeSize[options.type]
    this.calculateMode()
    this.longToast = new app.weToast()
  },

  calculateMode: function() {
    let areaWidth = app.sysInfo.windowWidth - 25 - 40
    let areaHeight = app.sysInfo.windowHeight - 230 - 40
    let that = this
    let imgArr = this.data.imgArr
    _.mapObject(this.modeSize, function(val, key) {
      imgArr[key].imgs = Array(val.h_num * val.v_num).fill({ url: '' })
      let scale = val.width / val.height
      imgArr[key].width = areaWidth / val.h_num
      imgArr[key].height = imgArr[key].width / scale
      if (imgArr[key].height > (areaHeight / val.v_num)) {
        imgArr[key].height = areaHeight / val.v_num
        imgArr[key].width = imgArr[key].height * scale
      }
    })
    this.setData({
      imgArr: imgArr
    })
  },

  checkdirection: function(e) {
    let direction = e.currentTarget.dataset.type
    this.setData({
      direction: direction
    })
  },

  addImg: function(e) {
    let index = e.currentTarget.dataset.index
    this.checkedIndex = index

    this.selectComponent("#checkComponent").showPop()
  },

  chooseImgs: co.wrap(function*(e) {
    try{

      this.longToast.toast({
        type: "loading",
      })
    let imgs = e.detail.tempFiles[0].path
    console.log(imgs)
    let that = this
    let imgSrc=yield upload.uploadFile(imgs)
    let imaPath = yield imginit.imgInit(imgSrc, 'vertical')
    let localUrl = imaPath.imgNetPath
    let imageInfo = imaPath.imageInfo
    this.data.imgArr[this.data.direction].imgs[this.checkedIndex]={
      url:localUrl,
      imgInfo:imageInfo
    }
    this.setData({
      imgArr:this.data.imgArr
    })
    this.longToast.toast()
  }catch(e){
    console.log(e)
  }
  }),

  editImg: co.wrap(function*(e) {
    let index = e.currentTarget.dataset.index
    wxNav.navigateTo('/pages/package_feature/print_sticker/edit', {
      imgInfo: encodeURIComponent(JSON.stringify(this.data.imgArr[this.data.direction].imgs[index])),
      index: index,
      photoMedia: encodeURIComponent(JSON.stringify(this.modeSize[this.data.direction])),
      mediaType:this.mediaType
    })
  }),

  deleteImg: co.wrap(function*(e) {
    let index = e.currentTarget.dataset.index
    let conf=yield showModal({
      title: '提示',
      content: '确认删除照片？',
      confirmColor: '#FFE27A'
    })
    if(conf.confirm){
      this.data.imgArr[this.data.direction].imgs[index]={}
      this.setData({
        imgArr:this.data.imgArr
      })
    }
  }),

  toPreview: function() {

  },

})
