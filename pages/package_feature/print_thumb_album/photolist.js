// pages/package_feature/print_thumb_album/photolist.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const upload = require('../../../utils/upload')
const imginit = require('../../../utils/imginit')
const event = require('../../../lib/event/event')

const showModal = util.promisify(wx.showModal)

import wxNav from '../../../utils/nav.js'
let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    //图片尺寸
    photoSize: {
      width: 450,
      height: 600
    },

    //图片数组
    imagesLength: 18,
    images: [],
    selectedImgIndex: 0, // 选中的图片index
    //图片尺寸
    imgSize: {},

    showProcess: false,
    completeCount: 0,
    count: 0,
    percent: 0,
    errTip: '',

    chooseCount: 1,
  },
  clickIndex: 0, //当前点击的idnex
  onLoad: function(options) {
    this.setData({
      images: Array(this.data.imagesLength).fill([])
    })
    this.type=options.type||'mini_album'
    this.calculateSize()
    event.on('setPreData', this, (postData)=>{
      this.editPhoto(postData)
    })
  },
  editPhoto:function(postData){
    this.longToast.toast({
      type: "loading",
    })
    this.setData({
      [`images[${postData.index}].url`]:postData.url
    })
    this.longToast.toast()
  },

  calculateSize: function() {

    let areaWidth = app.sysInfo.windowWidth - 100
    let areaHeight = (app.sysInfo.windowHeight - 65) * 0.38
    let photoScal = this.data.photoSize.width / this.data.photoSize.height
    let imgSize = {}
    if (photoScal > areaWidth / areaHeight) {
      imgSize.width = areaWidth
      imgSize.height = areaWidth / photoScal
    } else {
      imgSize.height = areaHeight
      imgSize.width = areaHeight * photoScal
    }
    imgSize.imgWidth = (app.sysInfo.windowWidth - (88 * app.sysInfo.windowWidth / 750)) / 6
    imgSize.imgHeight = imgSize.imgWidth / photoScal
    this.setData({
      imgSize: imgSize
    })
  },

  showCheck: function(e) {
    this.clickIndex = e.currentTarget.dataset.index
    let restImgArr = this.data.images.slice(this.clickIndex)
    let restCount = restImgArr.length - _.without(_.pluck(restImgArr, 'url'), undefined).length
    let count = restCount > 9 ? 9 : restCount
    this.setData({
      chooseCount: count
    })
    this.selectComponent("#checkComponent").showPop()
  },

  chooseImgs: function(e) {
    let imgs = e.detail.tempFiles
    let that = this
    let paths = []
    try {
      _.each(imgs, function(value, index) {
        if (value.size < 20000000) {
          paths.push(value.path)
        }
      })
      Loger(paths)
      //没有可用图片列表时提示
      if (paths.length == 0) {
        this.setData({
          showProcess: true,
          errTip: '已为您过滤部分不适合打印的照片（大于20M)'
        })
        setTimeout(function() {
          that.setData({
            showProcess: false,
          })
        }, 5000)
      } else {
        app.cancelUpload = false
        this.setData({
          showProcess: true,
          count: paths.length
        })
        upload.uploadFiles(paths, function(index, path) {
          if (_.isNotEmpty(index) && _.isNotEmpty(path)) {
            that.setData({
              completeCount: index
            })
            that.showImage(path, index)
          } else {
            if (app.cancelUpload == true) {
              return
            }
            that.setData({
              showProcess: false
            })
            wx.showModal({
              title: '照片上传失败',
              content: '请检查网络或稍候再试',
              showCancel: false,
              confirmColor: '#FFE27A'
            })
          }
        }, function(process) {
          that.setData({
            percent: process
          })
        })
      }
    } catch (e) { Loger(e) }
  },

  //展示图片
  showImage: co.wrap(function*(url, index) {
    try {
      let image
      let that = this
      let imaPath = yield imginit.imgInit(url, 'vertical')
      let localUrl = imaPath.imgNetPath
      let imageInfo = imaPath.imageInfo
      //大图过滤
      if (imageInfo.width / imageInfo.height > 5 || imageInfo.height / imageInfo.width > 5) {
        if (index == that.data.count) {
          that.setData({
            errTip: '已为您过滤部分不适合打印的照片（长宽比大于5)'
          })
          setTimeout(function() {
            that.setData({
              showProcess: false
            })
          }, 5000)
        }
        this.smallImgDelete = true
        return
      }

      image = {
        url: localUrl,
        localUrl: localUrl,
        width: imageInfo.width,
        height: imageInfo.height,
      }
      let imgIndex = Number(index-1) + Number(this.clickIndex)
      console.log(imgIndex,index,this.clickIndex)
      let insertIndex = _.findIndex(this.data.images.slice(imgIndex), function(value) {
        return value.url == undefined
      })
      console.log(insertIndex)
      if (insertIndex >= 0) {
        imgIndex += insertIndex
      }
      console.log(imgIndex)
      this.setData({
        [`images[${imgIndex}]`]:image,
        selectedImgIndex: this.clickIndex
      })
      //最后一张图结束清空隐藏进度条
      if (index == that.data.count) {
        that.setData({
          showProcess: false
        })
        if (this.smallImgDelete) {
          that.setData({
            showProcess: true,
            errTip: '已为您过滤部分不适合打印的照片（长宽比大于5)'
          })
          setTimeout(function() {
            that.setData({
              showProcess: false
            })
          }, 5000)
        }
        Loger('***图片处理结束，所有照片：***', that.data.photoList)
      }
    } catch (e) {
      Loger(e)
    }
  }),

  clickImg:function(e){
    let index=e.currentTarget.dataset.index
    this.setData({
      selectedImgIndex:index
    })
  },

  toEdit:function(e){
    let index = this.data.selectedImgIndex
    wxNav.navigateTo('/pages/package_feature/print_thumb_album/edit', {
      imgInfo: encodeURIComponent(JSON.stringify(this.data.images[index])),
      index: index,
      photoMedia: encodeURIComponent(JSON.stringify(this.data.photoSize)),
      mediaType:this.type
    })
  },

})
