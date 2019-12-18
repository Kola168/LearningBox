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
import commonRequest from '../../../utils/common_request'

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
    this.mediaType=options.mediaType||'photo_sticker'
    this.setData({
      type: options.type
    })
    this.modeSize = this.data.modeSize[options.type]
    this.calculateMode()
    this.longToast = new app.weToast()
    event.on('setPreData', this, (postData) => {
      this.editPhoto(postData)
    })
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
        localUrl:localUrl,
        imgInfo:imageInfo
      }
      this.setData({
        imgArr:this.data.imgArr
      })
      this.editImg(this.checkedIndex)
      this.longToast.toast()
    }catch(e){
      this.longToast.toast()
      console.log(e)
    }
  }),

  baiduprint:co.wrap(function*(e){
    let imgSrc=e.detail[0].url
    let imaPath = yield imginit.imgInit(imgSrc, 'vertical')
    let localUrl = imaPath.imgNetPath
    let imageInfo = imaPath.imageInfo
    this.data.imgArr[this.data.direction].imgs[this.checkedIndex]={
      url:localUrl,
      localUrl:localUrl,
      imgInfo:imageInfo
    }
    this.setData({
      imgArr:this.data.imgArr
    })
    this.editImg(this.checkedIndex)
  }),

  editImg: co.wrap(function*(e) {
    let index = e.currentTarget?e.currentTarget.dataset.index:e
    wxNav.navigateTo('/pages/package_feature/print_sticker/edit', {
      imgInfo: encodeURIComponent(JSON.stringify(this.data.imgArr[this.data.direction].imgs[index])),
      index: index,
      photoMedia: encodeURIComponent(JSON.stringify(this.modeSize[this.data.direction])),
      mediaType:this.mediaType,
      direction:this.data.direction,
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


  editPhoto: function(postData) {
    this.longToast.toast({
      type: "loading",
    })
    this.data.imgArr[postData.direction].imgs[postData.index].url=postData.url
    this.setData({
      imgArr: this.data.imgArr
    })
    this.longToast.toast()
  },

  onUnload: function() {
    event.remove('setPreData', this)
  },

  toPreview: co.wrap(function*() {
    if(_.without(_.pluck(this.data.imgArr[this.data.direction].imgs,'url'),'').length==0){
      return wx.showModal({
        title: '提示',
        content: '至少上传一张照片哦',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
    }
    try{
      let params={
        paper_type:this.data.type,
        step_method:'two',
        before_rotate:(this.data.type=='two'&&this.data.direction=='vertical'||this.data.type=='four'&&this.data.direction=='horizontal')?true:false,
        feature_key:this.mediaType,
        urls:_.without(_.pluck(this.data.imgArr[this.data.direction].imgs,'url'),'')
      }
      const resp = yield api.processes(params)
      wxNav.navigateTo('/pages/package_feature/print_sticker/preview',{
        type:this.mediaType,
        sn:resp.res.sn,
        imgSrc:encodeURIComponent(JSON.stringify(resp.res.url))
      })
      Loger(resp)
    }catch(e){
      Loger(e)
    }
  }),

})
