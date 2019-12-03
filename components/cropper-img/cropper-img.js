// components/cropper-img/cropper-img.js

import props from './common/props'
import cropperUtils from './common/cropperUtils'
import cropper from './common/drawShape'
import utils from './common/utils'
import cropperEntry from './common/cropperEntry'
import {
  cropperTypes
} from './common/config'

var componentsData = {
  properties: {
    ...props
  },
  data: {
    cropperMovableItems: [], // 多点坐标信息
    cropperData: {
      hidden: true,
      left: 0,
      maxLength: 2500,
      top: 0,
      itemLength: 64,
      // itemLength: 26,
      itemOffset: 30,
      imageInfo: {
        path: '',
        width: 0,
        height: 0
      },
      scaleInfo: {
        x: 1,
        y: 1
      },
      cropCallback: null,
      sizeType: ['original', 'compressed'], //'original'(default) | 'compressed'
      original: true, // 默认不压缩
      mode: 'rectangle', //默认矩形
    },
    cropperChangeableData: {
      canCrop: true,
      rotateDegree: 0,
      originalSize: {
        width: 0,
        height: 0
      },
      scaleSize: {
        width: 0,
        height: 0
      },
      previewImageInfo: {
        x: 0,
        y: 0,
        w: 0,
        h: 0
      }
    },
  },
  methods: {
    initCropperTemps: function (temps) {
      this.setTempInfo(temps)
    },
    /**
     * @methods 设置模板四个点的坐标
     * @param {*} croppers  裁剪模板信息
     */
    setTempInfo: function (croppers) {
      try {
        var mode = croppers.mode || cropperTypes.rect
        this.cropperEntry = cropperEntry(mode) //设置裁剪模式入口
        this.setData({
          cropperMovableItems: this.cropperEntry.setInitMovePoints(croppers.tempInfo)
        })
      } catch (err) {
        console.log(err)
      }
    },
    /**
     * @methods 开始进行图片绘制
     */
    startCropper: function (options) {
      var _this = this
      var src = options.src
      var mode = options.mode
      var callback = options.callback || function () {}
      var maxLength = options.maxLength
      var sizeType = options.sizeType.slice(-1)
      var cropperData = _this.data.cropperData

      if (!src) {
        return utils.showToast({
          title: '未获取到图片',
          icon: 'none'
        })
      }
      utils.getImageInfo({
        src
      }).then(res => {
        var w = _this.imgWidth = res.width
        var h = _this.imgHeight = res.height
        var size = cropperUtils.getAdjustMaxSize(w, h, maxLength)

        cropperData = Object.assign({
          ...cropperData, //原始数据
          original: sizeType.indexOf('original') > -1 ? true : false,
          maxLength: maxLength || cropperData.maxLength, // 设置最大长度
          mode: mode || cropperData.mode, // 设置绘制模式 矩形 & 不规则
          sizeType: sizeType, //图片是否压缩 & 原图
          imageInfo: {
            path: src,
            width: size.width,
            height: size.height
          },
          cropCallback: callback, //设置裁剪完成回调
        })
        _this.setData({
          cropperData
        }, () => {
          _this.loadEntry(mode)
        })
      })
    },
    clearCanvas: function () {

    },
    /**
     * @methods  根据不提供模式加载不入口
     * @param {*} mode 组件模式 & 
     */
    loadEntry: function (mode) {
      var _this = this
      var modeSet = {
        [cropperTypes.rect]: {
          func: _this.rotateImage,
          pms: []
        },
        [cropperTypes.quadRect]: {
          func: _this.loadImage,
          pms: [_this.imgWidth, _this.imgHeight]
        }
      }
      return modeSet[mode].func.apply(_this, modeSet[mode].pms)
    },
    /**
     * @methods 根据图片大小设置canvas大小，并绘制图片
     */
    loadImage: function (width, height, isRotate = false, pointData = false) {
      // var 
      var _this = this
      var src = _this.data.cropperData.imageInfo.path
      var cropperTempInfo = _this.data.croppers.tempInfo
      var size = cropperUtils.getAdjustSize(cropperTempInfo.width, cropperTempInfo.height, width, height)

      // 适应屏幕的位置
      var left = (cropperTempInfo.width - size.width) / 2 + _this.data.cropperData.itemOffset
      var top = (cropperTempInfo.height - size.height) / 2 + cropperTempInfo.top

      var updateData = {} //设置一个总的setData Object
      var cropperData = _this.data.cropperData
      var compressedScale = _this.data.cropperData.original ? 1.0 : 0.4
      var imgScale = (size.width / width)

      updateData.cropperData = Object.assign(cropperData, {
        imageInfo: !isRotate ? {
          path: src,
          width: width,
          height: height
        } : cropperData.imageInfo,
        left,
        top,
        width: size.width,
        height: size.height,
        scaleInfo: {
          x: width * compressedScale / size.width,
          y: height * compressedScale / size.height
        }
      })

      var cropperMovableItems = this.cropperEntry.setMovePoints(size)

      // 设置移动的四点坐标信息
      updateData.cropperMovableItems = pointData ? [{
          x: pointData.tlx * imgScale,
          y: pointData.tly * imgScale
        },
        {
          x: pointData.trx * imgScale,
          y: pointData.try * imgScale
        },
        {
          x: pointData.blx * imgScale,
          y: pointData.bly * imgScale
        },
        {
          x: pointData.brx * imgScale,
          y: pointData.bry * imgScale
        }
      ] : cropperMovableItems


      var cropperChangeableData = _this.data.cropperChangeableData
      var rotateDegree = cropperChangeableData.rotateDegree

      // 判断是否为垂直方向
      var isVertical = rotateDegree % 180 > 0
      var rotateWidth = isVertical ? size.height : size.width
      var rotateHeight = isVertical ? size.width : size.height
      // 设置预览图片坐标及尺寸信息
      cropperChangeableData.previewImageInfo = {
        x: (cropperTempInfo.width - rotateWidth) / 2,
        y: (cropperTempInfo.height - rotateHeight) / 2,
        w: rotateWidth,
        h: rotateHeight
      }

      cropperChangeableData.originalSize = {
        width: width,
        height: height
      }
      cropperChangeableData.scaleSize = {
        width: size.width,
        height: size.height
      }

      updateData.cropperChangeableData = cropperChangeableData
      var originalCtx = wx.createCanvasContext("originalCanvas", _this)
      // // 开始绘制图片
      cropper.drawImage.call(_this,
        originalCtx,
        updateData.cropperData,
        cropperChangeableData, {
          path: src,
          width: width,
          height: height
        })
      // 移动区域
      _this.moveCtx = wx.createCanvasContext("moveCanvas", _this)

      _this.setData(updateData, () => {
        _this.drawShape(cropperData.cropCallback) // 开始绘制边框和移动点
      }) //设置总的数据更新
    },
    /**
     * @methods 加载旋转 绘制图片
     */
    rotateImage: function () {
      var _this = this
      var cropperTempInfo = _this.data.croppers.tempInfo
      var imageInfo = _this.data.cropperData.imageInfo
      var width = imageInfo.width
      var height = imageInfo.height
      var rotateDegree = _this.data.cropperChangeableData.rotateDegree

      rotateDegree = rotateDegree == (0) ? (270) : rotateDegree - 90 //逆时针

      var isVertical = (rotateDegree) % (180) > 0 // 判断是否为垂直方向

      var rotateWidth = isVertical ? height : width
      var rotateHeight = isVertical ? width : height
      _this.setData({
        isRotate: isVertical ? true : false
      })

      var size = cropperUtils.getAdjustSize(cropperTempInfo.width, cropperTempInfo.height, rotateWidth, rotateHeight)
      var cropperData = _this.data.cropperData
      var cropperChangeableData = _this.data.cropperChangeableData

      // 适应屏幕的位置
      cropperData.left = (cropperTempInfo.width - size.width) / 2
      cropperData.top = (cropperTempInfo.height - size.height) / 2


      cropperChangeableData.originalSize = {
        width: rotateWidth,
        height: rotateHeight
      }
      cropperChangeableData.scaleSize = {
        width: size.width,
        height: size.height
      }
      cropperChangeableData.rotateDegree = rotateDegree

      _this.setData({
        cropperChangeableData,
        cropperData,
      }, () => {
        _this.loadImage(rotateWidth, rotateHeight, true)
      })
    },
    /**
     * @param {*} param0 
     */
    touchStart: function ({
      changedTouches
    }) {
      var _this = this
      _this.touchX = changedTouches[0].clientX
      _this.touchY = changedTouches[0].clientY
      _this.lastMoveX = 0
      _this.lastMoveY = 0
    },
    /**
     * 
     * @param {key} String  
     */
    touchMove: function ({
      currentTarget: {
        dataset: {
          key
        }
      },
      changedTouches
    }) {
      var _this = this
      var originalSize = _this.data.cropperChangeableData.originalSize
      var path = _this.data.cropperData.imageInfo.path
      var eventFunc = _this.setupMoveItem //默认执行不规则模式

      if (['up', 'bottom', 'left', 'right'].indexOf(key) > -1) { //矩形模式下
        eventFunc = _this.setupBorderMoveItem
      } else if (key === 'all') { // 矩形模式下
        eventFunc = _this.setupOuterMoveItem
      }

      eventFunc.call(_this, key, changedTouches, {
        path: path,
        width: originalSize.width,
        height: originalSize.height
      })
    },
    /**
     * 
     * @param {*} param0 
     */
    touchEnd: function ({
      currentTarget: {
        dataset: {
          key
        }
      },
      changedTouches
    }) {
      var _this = this
      var cropperChangeableData = _this.data.cropperChangeableData
      var path = _this.data.cropperData.imageInfo.path
      var eventFunc = _this.setupMoveItem //默认执行四点操作

      if (['up', 'bottom', 'left', 'right'].indexOf(key) > -1) {
        eventFunc = _this.setupBorderMoveItem
      } else if (key === 'all') {
        eventFunc = _this.setupOuterMoveItem
      }

      eventFunc.call(_this, key, changedTouches, {
        path: path,
        width: cropperChangeableData.originalSize.width,
        height: cropperChangeableData.originalSize.height
      }, (cropperMovableItems, canCrop) => {
        cropperChangeableData.canCrop = canCrop
        _this.setData({
          cropperChangeableData: cropperChangeableData,
          cropperMovableItems: cropperMovableItems
        })
      })
    },
    // 设置多个移动角
    setupMoveItem: function (key, changedTouches, imageInfo, callback) {
      try {
        if (changedTouches.length != 1) return
        var _this = this
        var cropperMovableItems = _this.data.cropperMovableItems

        cropperMovableItems = this.cropperEntry.adjustMovePoints.call(_this, cropperMovableItems, key, changedTouches, imageInfo)
        _this.setData({
          cropperMovableItems
        })
        _this.drawShape(callback)
      } catch (err) {
        console.log(err)
      }
    },
    // 设置移动中心点
    setupOuterMoveItem: function (key, changedTouches, imageInfo, callback) {
      try {
        var _this = this
        var cropperData = _this.data.cropperData
        var cropperTempInfo = _this.data.croppers.tempInfo
        var [topLeft, topRight, bottomLeft, bottomRight] = _this.data.cropperMovableItems
        var mode = cropperData.mode
        var size = cropperUtils.getAdjustSize(cropperTempInfo.width, cropperTempInfo.height, imageInfo.width, imageInfo.height)

        if (changedTouches.length != 1) return
        var touch = changedTouches[0]
        var x = touch.clientX
        var y = touch.clientY
        var width = topRight.x - topLeft.x
        var height = bottomLeft.y - topLeft.y
        _this.moveX = topLeft.x + x - _this.touchX - _this.lastMoveX
        _this.moveY = topLeft.y + y - _this.touchY - _this.lastMoveY
        x = topLeft.x + x - _this.touchX - _this.lastMoveX
        y = topLeft.y + y - _this.touchY - _this.lastMoveY
        _this.lastMoveX = touch.clientX - _this.touchX
        _this.lastMoveY = touch.clientY - _this.touchY

        topLeft.x = x
        topLeft.y = y
        // 边界检测，使截图不超出截图区域,区别于边界和四个角的顶点
        x = x < 0 ? 0 : (x > size.width ? size.width : x)
        y = y < 0 ? 0 : (y > size.height ? size.height : y)

        x = (x + width) > size.width ? (size.width - width) : ((x + width) < 0 ? 0 : x)
        y = (y + height) > size.height ? (size.height - height) : ((y + height) < 0 ? 0 : y)
        topLeft.x = x
        topLeft.y = y

        topLeft.x = x
        topLeft.y = y
        topRight.x = x + width
        topRight.y = y
        bottomLeft.x = x
        bottomLeft.y = y + height
        bottomRight.x = x + width
        bottomRight.y = y + height
        var cropperMovableItems = [topLeft, topRight, bottomLeft, bottomRight]

        _this.setData({
          cropperMovableItems
        }, () => {
          _this.drawShape(callback)
        })
      } catch (err) {
        console.log(err)
      }
    },
    // 设置移动边框
    setupBorderMoveItem: function (key, changedTouches, imageInfo, callback) {
      try {
        var _this = this
        var cropperData = _this.data.cropperData
        var cropperTempInfo = _this.data.croppers.tempInfo
        var [topLeft, topRight, bottomLeft, bottomRight] = _this.data.cropperMovableItems
        var left = cropperData.left
        var top = cropperData.top
        var mode = cropperData.mode
        var size = cropperUtils.getAdjustSize(cropperTempInfo.width, cropperTempInfo.height, imageInfo.width, imageInfo.height)

        if (changedTouches.length != 1) return
        var touch = changedTouches[0]
        var x = touch.clientX
        var y = touch.clientY

        if (key === 'up') {
          y = y - top
          topLeft.y = y
        } else if (key === 'right') {
          x = x - left
          topRight.x = x
        } else if (key === 'bottom') {
          y = y - top
          bottomLeft.y = y
        } else if (key === 'left') {
          x = x - left
          bottomRight.x = x
        }

        // 边界检测，使截图不超出截图区域
        x = x < 0 ? 0 : (x > size.width ? size.width : x)
        y = y < 0 ? 0 : (y > size.height ? size.height : y)

        if (key === 'up') {
          topLeft.y = y
        } else if (key === 'right') {
          topRight.x = x
        } else if (key === 'bottom') {
          bottomRight.y = y
        } else if (key === 'left') {
          bottomLeft.x = x
        }

        // 如果是在矩形模式下
        // 同时设置相连两个点的位置，是相邻的两个点跟随着移动点动，保证选框为矩形
        if (key == 'up') {
          topRight.y = y
        } else if (key == 'right') {
          bottomRight.x = x
        } else if (key == 'bottom') {
          bottomLeft.y = y
        } else if (key == 'left') {
          topLeft.x = x
        }

        //矩形翻转检测，四边的相对位置必须要固定,检测左上，左下，右上三个点
        if (key === 'up') {
          if (topLeft.y > (bottomLeft.y - 32)) { //上边检测
            console.log('上边检测=============')
            topLeft.y = bottomRight.y - 32
            topRight.y = bottomRight.y - 32
          }
        } else if (key === 'right') { //右边检测
          if (topRight.x < (topLeft.x + 32)) {
            console.log('右边检测==============')
            topRight.x = topLeft.x + 32
            bottomRight.x = topLeft.x + 32
          }
        } else if (key === 'bottom') { //下边检测
          if (bottomLeft.y <= (topLeft.y + 32)) {
            console.log('下边检测=============')
            bottomLeft.y = topLeft.y + 32
            bottomRight.y = topLeft.y + 32
          }
        } else if (key === 'left') { //左边检测
          if (topLeft.x > (topRight.x - 32)) {
            console.log('左边检测==============')
            x = topRight.x - 32
            bottomLeft.x = x
            topLeft.x = x
          }
        }

        var cropperMovableItems = [topLeft, topRight, bottomLeft, bottomRight]
        _this.setData({
          cropperMovableItems
        }, () => {
          _this.drawShape(cropperMovableItems, callback)
        })
      } catch (err) {
        console.log(err)
      }
    },
    cropImage: function (cropCallback, errCallback) {
      var _this = this
      _this.cropperEntry.exportCropper.call(_this, (res) => {
        cropCallback && cropCallback(res)
      }, (err) => {
        errCallback && errCallback(err)
      })
    },
    // 绘制边框和点
    drawShape: function (callback) {
      var _this = this
      this.cropperEntry.drawShape.call(_this, () => {
        callback && callback(_this.data.cropperMovableItems)
      })
    }
  }
}


Component(componentsData)