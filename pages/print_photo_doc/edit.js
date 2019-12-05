"use strict"

const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const _ = require('../../lib/underscore/we-underscore')
const imginit = require('../../utils/imginit')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const getImageInfo = util.promisify(wx.getImageInfo)
const downloadFile = util.promisify(wx.downloadFile)

const device = wx.getSystemInfoSync()
const W = device.windowWidth - 60
const H = device.windowHeight * 0.7 - 50
const TOP = 50


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

  model_data: {
    media_type: 'pic_to_doc'
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast();
    this.initPage(options)
    this.setData({
      croppers: {
        tempInfo: {
          width: W,
          height: H,
          top: TOP,
          left: 30
        },
        mode: 'quadrectangle'
      }
    })
    // var that = this
    // var options = that.options = JSON.parse(decodeURIComponent(options.params))
    // that.setData({
    //   isSingle: options.isSingle,
    //   currentCount: options.currentCount
    // })
    // that.longToast = new app.WeToast()
    // that.options = that.checkImgOptions(options.index)
    // cropper.init.apply(that, [W, H, TOP])
    // that.initData(that.options)
    // that.getColor()
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
        url: app.apiServer + `/boxapi/v2/apps/printer_capability`,
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

  initPage(options) {
    this.queryImages = JSON.parse(decodeURIComponent(options.images))
    if (options.type === 'upload') { // 判断首次上传
      this.longToast.toast({
        type: 'loading',
        title: '正在上传...'
      })
      this.initImg(); //初始化图片
    } else {
      if (this.queryImages) {
        this.getImageOrientation(this.queryImages.localUrl); //编辑图片
      }
    }
  },


  // /初始化图片上传/
  initImg() {
    try {
      let _this = this
      let paths = JSON.parse(JSON.stringify(this.queryImages))
      uploadFiles(paths, (index, url) => {
        if (index && url) {
          _this.getImageOrientation(url)
        } else {
          wx.showModal({
            title: '照片上传失败',
            content: '请检查网络或稍候再试',
            showCancel: false,
            confirmColor: '#FFDC5E'
          })
        }
        _this.longToast.hide()

      }, () => { })
    } catch (err) {
      _this.longToast.hide()
    }
  },


  // 图片信息获取
  getImageOrientation: co.wrap(function* (url = '') {
    let _this = this

    _this.images = {
      isSmallImage: false
    }

    _this.longToast.toast({
      type: 'loading',
      title: '图片加载中'
    })
    try {
      let imaPath = yield imgInit.imgInit(url, 'vertical')
      _this.resetImage(imaPath.imageInfo, imaPath.imgNetPath);
    } catch (e) {
      wx.showModal({
        title: '照片上传失败',
        content: '请检查网络或稍候再试',
        showCancel: false,
        confirmColor: '#FFDC5E'
      })
      _this.images = null
    } finally {
      _this.longToast.hide()
    }

  }),

  /**
 * @methods 图片处理 图片过滤 图片旋转
*/
  resetImage: co.wrap(function* (imageInfo, url) {
    let localUrl = url;
    let _this = this;
    let noRotate = _this.data.media_size[_this.model_data.media_type].noRotateMin;

    //大图过滤
    if (imageInfo.width / imageInfo.height > 5 || imageInfo.height / imageInfo.width > 5) {
      _this.images = null
      return wx.showModal({
        title: '提示',
        content: '您所上传的照片过大，请重新上传',
        showCancel: false,
        confirmColor: '#FFDC5E'
      })
    }

    _this.images = {
      url: imgInit.addProcess(url, noRotate), // 不做原始，可添加后缀
      localUrl: localUrl, // 原始默认图
      width: imageInfo.width, // 图片宽度
      height: imageInfo.height, // 图片高度
      isSmallImage: (imageInfo.width < 600 || imageInfo.height < 600) ? true : false, // 小图标记
    }

    _this.initShowImg(_this.images)
  }),

  initShowImg: co.wrap(function* (images) {
    this.options = {
      url: images.localUrl,
      mode: 'quadrectangle', //四点触点为圆形
      from: 'pic2doc',
    }
    this.setData({
      originalUrl: this.options.url
    })
    this.selectTap(); //合成图片
  }),

  /**
  * @methods 边缘检测合成图片
  */
  convert: co.wrap(function* (img) {
    this.longToast.toast({
      type: 'loading',
      title: '图片检测中'
    })
    try {
      const resp = yield request({
        url: app.apiServer + `/boxapi/v2/designs/smart_convert`,
        method: 'POST',
        dataType: 'json',
        data: {
          img_url: img,
          openid: app.openId
        }
      })
      this.longToast.hide()
      if (resp.data.code != 0) {
        return wx.showModal({
          title: '提示',
          content: resp.data.message || '服务器异常',
          showCancel: false,
          confirmColor: '#FFDC5E'
        })
      }
      return resp.data.res;

    } catch (e) {
      this.longToast.hide()
      wx.showModal({
        title: '提示',
        content: '请检查您的网络，请稍后重试',
        showCancel: false,
        confirmColor: '#FFDC5E'
      })
    }
  }),

  /**
  * @methods 合成参数
  */
  judgeConvert: co.wrap(function* (data) {
    try {
      let _this = this;
      let initParam = false;
      let {
        param,
        imgWidth,
        imgHeight
      } = data;
      let initSite = {
        tlx: 0, //左上
        tly: 0,
        trx: imgWidth, //右上
        try: 0,
        blx: 0, //左下
        bly: imgHeight,
        brx: imgWidth, //右下
        bry: imgHeight,
      } // 初始化默认坐标
      let compareWidth = _this.overImg(imgWidth)
      let compareHeight = _this.overImg(imgHeight)

      if (compareWidth([param.tlx, param.trx, param.blx, param.brx])) {
        initParam = true
      } else if (compareHeight([param.tly, param.try, param.bly, param.bry])) {
        initParam = true
      }

      if (_this.smallLength(param.tlx, param.tly, param.trx, param.try)) {
        initParam = true
      } else if (_this.smallLength(param.tlx, param.tly, param.blx, param.blx)) {
        initParam = true
      } else if (_this.smallLength(param.brx, param.bry, param.trx, param.try)) {
        initParam = true
      } else if (_this.smallLength(param.blx, param.bly, param.brx, param.bry)) {
        initParam = true
      }

      logger.info('==initParam==', initParam)

      return initParam ? initSite : param;

    } catch (err) {
      logger.info(err)
    }

  }),

  overImg(length) {
    return function filter(points) {
      return points.some(function (point) {
        return ((point < 0 || point > length) ? true : false)
      })
    }
  },

  /**
  * @methods  是否是小图
  * @param {Number} leftX 
  * @param {Number} leftY 
  * @param {Number} rightX 
  * @param {Number} rightY 
  */
  smallLength(leftX, leftY, rightX, rightY) {
    let acceptLength = 50;
    let length = Math.sqrt((rightX - leftX) * (rightX - leftX) + (rightY - leftY) * (rightY - leftY));
    return length < acceptLength ? true : false

  },

  /**
    * @methods 图片绘制入口
    */
  selectTap: co.wrap(function* () {
    try {
      this.longToast.toast({
        type: 'loading',
        title: '图片处理中'
      })
      let _this = this;
      let tempFilePath = _this.options.url;
      let mode = this.options.mode;
      let textObj = null;
      let imageInfo = yield getImageInfo({
        src: tempFilePath
      })

      if (imageInfo.width > 8000 || imageInfo.height > 8000) { // 判断图片过大
        textObj = {
          title: '提示',
          content: '图片尺寸过大，请重新选择',
          showCancel: false,
          confirmColor: '#FFDC5E'
        }
      }
      if (imageInfo.width < 100 || imageInfo.height < 100) { //判断图片过小
        textObj = {
          title: '提示',
          content: '图片尺寸过小，请重新选择',
          showCancel: false,
          confirmColor: '#FFDC5E',
        }
      }

      if (textObj) {
        _this.longToast.hide()
        yield showModal(textObj)
        return router.navigateBack()
      }

      //旋转矫正
      let imgWidth = imageInfo.width;
      let imgHeight = imageInfo.height;

      _this.editScale = 1

      let editPath = tempFilePath
      if (imgWidth > 1500 || imgHeight > 1500) {
        editPath = imgInit.addProcess(editPath, `/resize,w_1500,h_1500`)
        _this.editScale = 1500 / (imgWidth > imgHeight ? imgWidth : imgHeight)
      }
      _this.longToast.hide()
      let params = yield this.convert(editPath) // 边缘检测合成和图片
      let newImageInfo = yield getImageInfo({
        src: editPath
      }) //图片更新后重新获取宽高，保证一致
      if (params.status) {
        this.data.pointData = yield this.judgeConvert({
          imgWidth: newImageInfo.width,
          imgHeight: newImageInfo.height,
          param: params,
        })
      }
      _this.ctx = _this.selectComponent('#cropper')
      // 开始图片绘制
      _this.ctx.startCropper({
        src: editPath,  //图片地址
        mode: mode, // 模式
        sizeType: ['original'], //图片压缩
        maxLength: 2000, //限制最大像素为2500像素
      })

    } catch (err) {
      logger.info(err)
    }
  }),

  /**
  * @methods 图片裁剪
  */
  cropImage: co.wrap(function* () {
    var _this = this
    var tempFilePath = _this.options.url
    _this.ctx.cropImage((res) => {
      _this.getPic(res, tempFilePath)
    })
  }),

  /**
  * @methods 非规则矩形裁切做透视变换
  */
  getPic: co.wrap(function* (res, imgUrl) {
    var _this = this
    _this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      const resp = yield request({
        url: app.apiServer + '/boxapi/v3/images/edit',
        method: 'POST',
        dataType: 'json',
        data: {
          tlx: res[0][0] / _this.editScale, //左上
          tly: res[0][1] / _this.editScale,
          trx: res[3][0] / _this.editScale, //右上
          try: res[3][1] / _this.editScale,
          blx: res[1][0] / _this.editScale, //左下
          bly: res[1][1] / _this.editScale,
          brx: res[2][0] / _this.editScale, //右下
          bry: res[2][1] / _this.editScale,
          url: imgUrl,
          gray: false,
          transform: true,
          is_async: true,
          feature_key: _this.model_data.media_type
        }
      })

      if (resp.data.code != 0) {
        throw (resp.data)
      }
      const img_src = resp.data && resp.data.url;
      event.emit('card_url_data', {
        url: img_src,
        originUrl: imgUrl,
        localUrl: img_src
      })
      _this.longToast.hide()
      router.navigateBack()
    } catch (e) {
      _this.longToast.hide()
      util.showErr(e)
    }
  }),

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
