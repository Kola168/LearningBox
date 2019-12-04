// pages/print_doc/duplicate_edit/duplicate_edit.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const event = require('../../../lib/event/event')
const imgInit = require('../../../utils/imginit')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const getImageInfo = util.promisify(wx.getImageInfo)

const device = wx.getSystemInfoSync()
const W = device.windowWidth - 60
const H = device.windowHeight * 0.7 - 50
const TOP = 50
import { uploadFiles } from '../../../utils/upload'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger'
const logger = new Logger.getLogger('pages/print_doc/duplicate_edit/duplicate_edit')


Page({
  data: {
    //每次上传张数
    images: null,
    media_size: {
      //a4尺寸
      copy: {
        width: 2520,
        height: 3564,
        noRotateMin: '/resize,h_800/auto-orient,1/resize,m_mfit,h_282,w_200/quality,Q_85/format,jpg'
      }
    },
    scale: 1,
    originalUrl: '',
    pointData: null,
    croppers: null
  },

  model_data: {
    media_type: 'copy'
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast();
    this.initPage(options)
    this.setData({
      croppers: {
        tempInfo: {
          width: W,
          height:H,
          top: TOP,
          left: 30
       },
       mode: 'quadrectangle'
      }
    })
  }),

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

      }, () => {})
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

      logger.info('==initParam==',initParam )

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
  cropImage: co.wrap(function*() {
    var _this = this
    var tempFilePath = _this.options.url
    _this.ctx.cropImage((res)=>{
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
  })
})