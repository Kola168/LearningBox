"use strict"

const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const _ = require('../../lib/underscore/we-underscore')
// var mta = require('../../utils/mta_analysis.js');
// const imginit = require('../../utils/imginit')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const getImageInfo = util.promisify(wx.getImageInfo)
const downloadFile = util.promisify(wx.downloadFile)

const device = wx.getSystemInfoSync()
const W = device.windowWidth - 60
const H = device.windowHeight * 0.7 - 50
const TOP = 50

// let cropper = require('../transform-cropper/welCropper.js');
// import modal from '../../components/confirm-reinforce-modal/event'

Page({
  data: {
    scale: 1,
    index: -1,
    currentIndex: 0,
    originalUrl: '',
    selectColors: [
      {
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
    galleryImages: {
      images: []
    }
  },
  onLoad: co.wrap(function* (options) {
    var that = this
    var options = that.options = JSON.parse(decodeURIComponent(options.params))
    that.setData({
      isSingle: options.isSingle,
      currentCount: options.currentCount
    })
    that.longToast = new app.WeToast()
    that.options = that.checkImgOptions(options.index)
    cropper.init.apply(that, [W, H, TOP])
    that.initData(that.options)
    that.getColor()
    mta.Page.init()
  }),
  // 检查入参 是否是有效数据
  checkImgOptions: function (index) {
    let galleryImages = this.getImgStorage()
    let image = galleryImages.images[index]
    if (!image) {
      return wx.navigateBack()
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
  initData: function (options, flag) {
    if (!options) {
      return
    }
    this.longToast.toast({
      img: '../../images/loading.gif',
      title: '加载中',
      duration: 0
    })
    var refreshIndex = !flag ? Number(options.index) : this.data.refreshIndex
    this.setData({
      index: Number(options.index), //从0开始
      currentIndex: this.data.currentIndex + 1, //从1开始
      originalUrl: options.url || '',
      refreshIndex: refreshIndex,
      galleryImages: this.getImgStorage(),
      selectColors: [
        {
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

    this.selectTap() // 图形绘制
  },
  getColor: co.wrap(function* () {
    let param = {
      openid: app.openId
    }
    try {
      const resp = yield request({
        url: app.apiServer + `/ec/v2/apps/printer_capability`,
        method: 'GET',
        dataType: 'json',
        data: param
      })
      if (resp.data.code == 1001) {
        this.removeColorCapability()
      } else if (resp.data.code != 0) {
        throw (resp.data)
      } else {
        console.log('色彩选择', resp.data.print_capability.color_modes)
        let color_length = resp.data.print_capability.color_modes.length
        if (color_length == 1) {
          this.removeColorCapability()
        }
      }
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),
  removeColorCapability: function () {
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
  getImgStorage: function (media_type) {
    try {
      let galleryImages = wx.getStorageSync(media_type || this.options.media_type)
      return galleryImages
    } catch (err) {

    }
  },
  // 删除当前张
  deleteCurrentImage: function () {
    try {
      wx.showModal({
        title: '提示',
        content: '编辑不易,确认删除此张照片',
        confirmColor: '#ffe27a',
        success: (res) => {
          if (res.confirm) {
            this.removeCurrentImage(this.options.index)
            if (this.data.isSingle) {
              return wx.navigateBack()
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
  removeCurrentImage: function (index) {
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
  setImgStorage: function (media_type, galleryImages) {
    wx.setStorageSync(media_type, {
      media_type: media_type,
      images: galleryImages.images,
      allCount: galleryImages.images.length
    })
  },
  // 预览下一张
  setNextPreview: function () {
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
  selectTap(e) {
    let that = this
    let tempFilePath = this.options.url
    let mode = this.options.mode
    wx.getImageInfo({
      src: tempFilePath,
      success(res) {
        let imageInfo = res
        console.log(tempFilePath, res)
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
                wx.navigateBack()
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
        console.log('1500缩放比', width > height ? width : height, that.editScale)
        that.showCropper({
          src: editPath,
          mode: mode,
          sizeType: ['original'],
          maxLength: 2000, //限制最大像素为2500像素
          callback: (res) => {
            if (mode == "rectangle") {
              console.log("crop callback:" + res)
              that.uploadImage(res)
            } else {
              that.utilsPic({
                origin_url: tempFilePath,
                data: res,
              })
            }
          }
        })
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  showExamModal() {
    modal.showModal()
  },
  chooseColor({ currentTarget: { dataset: { index } } }) {
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
        mta.Event.stat('tupianzhuanwend', {
          printtype: current.key == 'Color' ? 'color' : 'black'
        })
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
    if (colors && colors.checked) {// 针对黑白处理的
      this.getBlackEnhanceSn(params.data, params.origin_url)
    } else { // 普通 灰度 | 全彩处理
      this.getPic(params.data, params.origin_url)
    }
  },
  // 获取编辑需要的sn
  getBlackEnhanceSn: co.wrap(function* (res, url) {
    this.longToast.toast({
      img: '/images/loading.gif',
      title: '请稍候',
      duration: 0
    })
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
        transform: true,
        media_type: 'pic2doc',
      }
      if (colors.key == 'Grays') {
        worker_data.bw = true
        worker_data.gray = false
      } else {
        worker_data.gray = colors.key == 'Color' ? false : true
      }
      const resp = yield request({
        url: app.apiServer + '/boxapi/v2/workers',
        method: 'POST',
        dataType: 'json',
        data: {
          openid: app.openId,
          handle: 'scan_image',
          worker_data,
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      this.longToast.toast()
      if (resp.data.res && resp.data.res.sn) {
        this.getLoopsPic(resp.data.res.sn)
      }
    } catch (err) {
      this.longToast.toast()
      console.log(err);
    }
  }),
  drawRequest(sn_key) {
    return new Promise(co.wrap(function* (resolve, reject) {
      const resp = yield request({
        url: app.apiServer + `/boxapi/v2/workers/${sn_key}`,
        method: 'GET',
        dataType: 'json'
      })
      if (resp.data.code != 0) {
        reject(resp.data)
      } else {
        resolve(resp.data && resp.data.res)
      }
    }))
  },
  // 轮询绘制编辑图片
  getLoopsPic(sn) {
    try {
      const nowTime = new Date(); // 初始化开始时间
      const _this = this;
      _this.setData({ showupLoad: true })
      _this.requestAnimationPercent()
      _this.timer = setInterval(() => {
        let carryTime = new Date() //执行时间
        if (carryTime - nowTime > 60000) { //判断处理大于12秒  提示处理失败
          _this.timer && clearInterval(_this.timer)
          _this.setData({ percent: 0, showupLoad: false })
          return util.showErr({ message: '图片处理失败, 请重新尝试!' })
        }
        // 开启绘制
        _this.drawRequest(sn).then(res => {
          if (res.state === 'processing') {
            return _this.setData({
              percent: _this.data.percent + 30
            })
          }
          _this.timer && clearInterval(_this.timer)
          _this.setData({ percent: 0, showupLoad: false })

          if (res.state === 'finished') {
            _this.setPrePageData(res.worker_data)
          } else if (res.state === 'failed') {
            util.showErr({ message: '绘制有误' })
          } else {
            console.log('drawRequest state: ', res)
          }
        })
      }, 3000)
    } catch (err) {
      console.log(`draw Pic Error =`, err);
    }
  },
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
  getPic: co.wrap(function* (res, imgUrl) {
    this.longToast.toast({
      img: '../../images/loading.gif',
      title: '请稍候',
      duration: 0
    })
    try {
      const [colors] = this.data.selectColors.filter(item => item.checked && item.key != 'Grays')
      const resp = yield request({
        url: app.apiServer + '/boxapi/v3/images/edit',
        method: 'POST',
        dataType: 'json',
        data: {
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
          'media_type': 'pic2doc',
        }
      })

      console.log('获取图片', resp.data)
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      this.setPrePageData(resp.data)
      this.longToast.toast()

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
    prevPage.setData({
      images: images
    })
    // 最后一次进行 或者单次 返回操作
    if (this.data.galleryImages.images.length == this.data.refreshIndex + 1 || this.data.isSingle) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      this.setNextPreview() //最后设置完成进行下一张图片初始化
      this.data.refreshIndex = this.data.refreshIndex + 1
    }
  },
  getPrePages: function (index) {
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    return prevPage
  },
  //上传图片
  uploadImage: co.wrap(function* (tempUlr) {
    this.longToast.toast({
      img: '../../images/loading.gif',
      title: '请稍候',
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
      return wx.navigateBack()
    } else {
      //首张图
      mta.Event.stat('tupianzhuanwend', {
        'cropperfix': 'true'
      })
      wx.redirectTo({
        url: `../error_book/pages/error_book/topic_details?url=${imgUrl}`
      })
    }

  }),
})
