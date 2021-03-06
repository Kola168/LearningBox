"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../utils/common_import'
const imginit = require('../../utils/imginit')
import common_request from '../../utils/common_request'
import modal from '../../components/confirm-reinforce-modal/event'
import getLoopsEvent from '../../utils/worker'
import event from '../../lib/event/event'
const device = wx.getSystemInfoSync()
const W = device.windowWidth - 40
const H = device.windowHeight * 0.7 - 100
const TOP = 140

Page({
  data: {
    scale: 1,
    index: -1,
    currentIndex: 0,
    originalUrl: '',
    selectColors: [{
        name: '黑白',
        key: 'Grays',
        selected: false, //用于点击的状态
        checked: false // 用于提交的状态
      },
      {
        name: '灰度',
        key: 'Mono',
        selected: false,
        checked: false
      },
      {
        name: '全彩',
        key: 'Color',
        selected: true,
        checked: true
      }
    ],
    percent: 0,
    showupLoad: false,
    showTitle: true,
    showContent: true,
    isSingle: false, //是否单张编辑
    croppers: null,
    isFullScreen: false,
    galleryImages: {
      images: []
    },
    currentIndex:0,
    currentCount:1,
  },

  onLoad: co.wrap(function*(options) {
    this.longToast = new app.weToast()
    this.postData=JSON.parse(decodeURIComponent(options.postData))
    console.log(this.postData)
    this.data.currentIndex=0
    this.setData({
      currentCount:this.postData.length
    })
    yield this.initEdit()
  }),

  initEdit: co.wrap(function *(){
    try{
      this.setData({
        isSingle: this.postData[0].isSingle,
      })
      this.options = this.postData[this.data.currentIndex]
      this.options = this.checkImgOptions(this.options.index)
      this.setData({
        isFullScreen: app.isFullScreen,
        croppers: {
          tempInfo: {
            width: W,
            height: H,
            top: TOP,
            left: 20
          },
          mode: 'quadrectangle'
        },
        currentIndex:this.data.currentIndex,
      })
      this.initData(this.options)
    }catch(e){
      console.log(e)
    }
  }),

  // 检查入参 是否是有效数据
  checkImgOptions: function(index) {
    let galleryImages = this.getImgStorage()
    let image = galleryImages.images[index]
    if (!image) {
      return wxNav.navigateBack()
    }
    if (!image.url) {
      this.removeCurrentImage(index)
      return this.checkImgOptions(index)
    }
    return {
      url: image.localUrl,
      mode: 'quadrectangle',
      from: 'pic2doc',
      index: index,
      media_type: galleryImages.media_type,
    }
  },

  // 初始化数据
  initData: co.wrap(function *(options, flag) {
    if (!options) {
      return
    }
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    var refreshIndex = !flag ? Number(options.index) : this.data.refreshIndex
    this.setData({
      index: Number(options.index), //从0开始
      currentIndex: this.data.currentIndex + 1, //从1开始
      originalUrl: options.url || '',
      refreshIndex: refreshIndex,
      galleryImages: this.getImgStorage(),
      selectColors: [{
          name: '黑白',
          key: 'Grays',
          selected: false, //用于点击的状态
          checked: false // 用于提交的状态
        },
        {
          name: '灰度',
          key: 'Mono',
          selected: false,
          checked: false
        },
        {
          name: '全彩',
          key: 'Color',
          selected: true,
          checked: true
        }
      ]
    })
    yield this.selectTap() // 图形绘制
  }),

  getColor: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      let res = common_request.getPrinterCapacity('doc_a4')
      if (res.code == 1001) {
        this.removeColorCapability()
      } else if (rescode != 0) {
        throw (res.data)
      } else {
        let color_length = resp.data.print_capability.color_modes.length
        if (color_length == 1) {
          this.removeColorCapability()
        }
      }
    } catch (e) {
      util.showErr(e)
    } finally {
      this.longToast.toast()
    }
  }),

  removeColorCapability: function() {
    this.data.selectColors.splice(2, 1)
    this.data.selectColors[1] = {
      name: '灰度',
      key: 'Mono',
      selected: true,
      checked: true
    }
    this.setData({
      selectColors: this.data.selectColors
    })
  },

  getImgStorage: function(media_type) {
    try {
      let galleryImages = storage.get(media_type || this.options.media_type)
      return galleryImages
    } catch (err) {
      logger.info(err)
    }
  },

  // 删除当前张
  deleteCurrentImage: function() {
    try {
      wx.showModal({
        title: '提示',
        content: '编辑不易,确认删除此张照片',
        confirmColor: '#ffe27a',
        success: (res) => {
          if (res.confirm) {
            this.removeCurrentImage(this.options.index)
            if (this.data.isSingle) {
              return wxNav.navigateBack()
            }
            this.options = this.checkImgOptions(this.options.index)
            this.options && this.initData(this.options)
          }
        }
      })
    } catch (err) {

    }
  },

  // 移除选中项和同步上一个页面数据
  removeCurrentImage: function(index) {
    let galleryImages = this.getImgStorage()
    galleryImages.images.splice(index, 1)
    this.setImgStorage(this.options.media_type, galleryImages) //同步缓存
    let prevPage = this.getPrePages()
    let images = prevPage.data.images
    images.splice(index, 1)
    prevPage.setData({
      images: images //同步上一个页面列表显示数据
    })
  },

  // 数据缓存
  setImgStorage: function(media_type, galleryImages) {
    storage.put(media_type, {
      media_type: media_type,
      images: galleryImages.images,
      allCount: galleryImages.images.length
    })
  },

  // 预览下一张
  setNextPreview: function() {
    let index = this.data.index
    this.data.refreshIndex = index
    this.data.index = (this.data.galleryImages.images.length - 1) == index ? index : (index + 1)
    let image = this.data.galleryImages.images[this.data.index]
    this.options = {
      url: image.localUrl,
      mode: 'quadrectangle',
      from: 'pic2doc',
      index: this.data.index,
      media_type: this.data.galleryImages.media_type,
    }
    this.initData(this.options, true)
  },

  selectTap: co.wrap(function *(e) {
    this.longToast.toast({
      type: 'loading',
      title: '加载中...'
    })
    let that = this
    let tempFilePath = this.options.url
    let mode = this.options.mode
    that.loadEnd = false
    wx.getImageInfo({
      src: tempFilePath,
      success(res) {
        let imageInfo = res
        let showText
        if (imageInfo.width < 100 || imageInfo.height < 100) {
          showText = '图片尺寸过小，请重新选择'
        }
        if (showText) {
          return wx.showModal({
            title: '提示',
            content: showText,
            showCancel: false,
            confirmColor: '#2086ee',
            success: (res) => {
              if (res.confirm) {
                wxNav.navigateBack()
              }
            }
          })
        }
        //旋转矫正
        let width = imageInfo.width
        let height = imageInfo.height
        that.editScale = 1
        let editPath = tempFilePath
        if (width > 1500 || height > 1500) {
          editPath = imginit.addProcess(editPath, `/resize,w_1500,h_1500`)
          that.editScale = 1500 / (width > height ? width : height)
        }
        var ctx = that.selectComponent('#cropper')
        ctx.startCropper({
          src: editPath,
          mode: mode,
          sizeType: ['original'],
          maxLength: 2000, //限制最大像素为2500像素)
          callback: ()=>{
            that.getColor()
            that.loadEnd = true
            that.longToast.hide()
          }
        })
        that.ctx = ctx
      },

      fail: (err) =>{
        wx.showModal({
          title: '提示',
          content: err,
          showCancel: false
        })
        this.longToast.hide()
      }
    })
  }),

  cropImage() {
    if (!this.loadEnd) {
      return wx.showModal({
        title: '提示',
        content: '等待图片加载完成',
        showCancel: false
      })
    }
    let mode = this.options.mode,
      tempFilePath = this.options.url
    this.ctx.cropImage((res) => {
      if (mode == "rectangle") {
        this.uploadImage(res)
      } else {
        this.utilsPic({
          origin_url: tempFilePath,
          data: res,
        })
      }
    })
  },

  showExamModal() {
    modal.showModal()
  },

  chooseColor({
    currentTarget: {
      dataset: {
        index
      }
    }
  }) {
    const current = this.data.selectColors[index]
    const selectColors = this.data.selectColors.map((item, idx) => {

      item.selected = (current.key == item.key) ? true : false

      if (current.key === 'Grays') {
        if (index == idx) {
          item.checked = true
        }
      } else {
        if (index == idx) {
          item.checked = true
        } else {
          item.checked = false
        }
      }
      return item
    })
    this.setData({
      selectColors
    })
  },

  // 处理图片的编辑
  utilsPic(params) {
    const [colors] = this.data.selectColors.filter(item => item.checked && item.key == 'Grays')
    if (colors && colors.checked) { // 针对黑白处理的
      this.getBlackEnhanceSn(params.data, params.origin_url)
    } else { // 普通 灰度 | 全彩处理
      this.getPic(params.data, params.origin_url)
    }
  },

  // 获取编辑需要的sn
  getBlackEnhanceSn: co.wrap(function*(res, url) {
    try {
      const [colors] = this.data.selectColors.filter(item => item.selected)
      let worker_data = {
        url: url,
        tlx: res[0][0] / this.editScale, //左上
        tly: res[0][1] / this.editScale,
        trx: res[3][0] / this.editScale, //右上
        try: res[3][1] / this.editScale,
        blx: res[1][0] / this.editScale, //左下
        bly: res[1][1] / this.editScale,
        brx: res[2][0] / this.editScale, //右下
        bry: res[2][1] / this.editScale,
        transform: true
      }
      if (colors.key == 'Grays') {
        worker_data.bw = true
        worker_data.gray = false
      } else {
        worker_data.gray = colors.key == 'Color' ? false : true
      }
      this.setData({
        showupLoad: true
      })
      this.requestAnimationPercent()
      getLoopsEvent({ feature_key: 'pic_to_doc', worker_data: worker_data }, (resp) => {
        if (resp.status == 'processing') {
          return this.setData({
            percent: this.data.percent + 30
          })
        }
        this.timer && clearInterval(_this.timer)
        this.setData({
          percent: 0,
          showupLoad: false
        })
        if (resp.status == 'finished') {
          this.longToast.hide()
          this.setPrePageData(resp.data)
        }
      }, () => {
        this.setData({
          percent: 0,
          showupLoad: false
        })
      })
    } catch (err) {
      logger.info(err);
    }
  }),

  requestAnimationPercent() {
    var timer = setInterval(() => {
      if (this.data.percent > 30) {
        return clearInterval(timer)
      }
      this.setData({
        percent: this.data.percent + 1
      })
    }, 500)
  },

  // 取消绘制黑白增加图片
  cancelDraw() {
    var _this = this
    _this.setData({
      showupLoad: false
    })
    _this.timer && clearInterval(_this.timer)
  },

  //非规则矩形裁切做透视变换
  getPic: co.wrap(function*(res, imgUrl) {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      const [colors] = this.data.selectColors.filter(item => item.checked && item.key != 'Grays')
      let params = {
        'url': imgUrl,
        'tlx': res[0][0] / this.editScale, //左上
        'tly': res[0][1] / this.editScale,
        'trx': res[3][0] / this.editScale, //右上
        'try': res[3][1] / this.editScale,
        'blx': res[1][0] / this.editScale, //左下
        'bly': res[1][1] / this.editScale,
        'brx': res[2][0] / this.editScale, //右下
        'bry': res[2][1] / this.editScale,
        'gray': colors.key == 'Color' ? false : true,
        'transform': true,
      }
      getLoopsEvent({ feature_key: 'pic_to_doc', worker_data: params }, (resp) => {
        if (resp.status == 'finished') {
          this.longToast.hide()
          this.setPrePageData(resp.data)
        }
      }, () => {
        this.longToast.hide()
      })
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  // 同步上一个页面的数据
  setPrePageData(resp) {
    const [colors] = this.data.selectColors.filter(item => item.checked && item.key != 'Grays')
    let prevPage = this.getPrePages()
    let images = prevPage.data.images
    images[this.data.refreshIndex].afterEditUrl = resp.url
    images[this.data.refreshIndex].color = colors.key
    images[this.data.refreshIndex].url = resp.thumbnail_url
    event.emit('setPreData', images)

    // 最后一次进行 或者单次 返回操作
    if (this.data.galleryImages.images.length == this.data.refreshIndex + 1 || this.data.isSingle) {
      wxNav.navigateBack()
    } else {
      this.setNextPreview() //最后设置完成进行下一张图片初始化
      this.data.refreshIndex = this.data.refreshIndex + 1
    }
  },

  getPrePages: function(index) {
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    return prevPage
  },
  
  //上传图片
  uploadImage: co.wrap(function*(tempUlr) {
    this.longToast.toast({
      type: 'loading',
      duration: 0
    })
    let imgUrl = yield app.newUploadImage(tempUlr)
    this.longToast.toast()
    this.hideCropper()

    //再次编辑、上传多张图
    if (this.options.from == 'topic_details') {
      let pages = getCurrentPages()
      let prevPage
      prevPage = pages[pages.length - 2]
      let urls = prevPage.data.urls
      urls.push(imgUrl)
      prevPage.setData({
        urls: urls
      })
      return wxNav.navigateBack()
    } else {
      wxNav.redirectTo(`../error_book/pages/error_book/topic_details`, {
        url: imgUrl
      })
    }
  })
})
