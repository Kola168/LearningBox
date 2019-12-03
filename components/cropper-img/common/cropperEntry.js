import utils from './utils'
import {
  cropperTypes
} from './config'
import cropperUtils from '../common/cropperUtils'
import draw from './drawShape'


// 坐标修正
var adjustPoints = function (changedTouches, imageInfo) {
  var _this = this
  var cropperData = _this.data.cropperData
  var cropperTempInfo = _this.data.croppers.tempInfo
  var left = cropperData.left
  var top = cropperData.top
  var size = cropperUtils.getAdjustSize(cropperTempInfo.width, cropperTempInfo.height, imageInfo.width, imageInfo.height)
  var touch = changedTouches[0]
  var x = touch.clientX
  var y = touch.clientY

  x = x - left
  y = y - top

  // 边界检测，使截图不超出截图区域
  x = x < 0 ? 0 : (x > size.width ? size.width : x)
  y = y < 0 ? 0 : (y > size.height ? size.height : y)

  return {
    x,
    y,
  }
}


// 矩形实现类
function Rect() {
  this.setInitMovePoints = function (size) {
    return [{
      x: 50,
      y: 50
    }, {
      x: size.width - 50,
      y: 50
    }, {
      x: 50,
      y: size.height - 50
    }, {
      x: size.width - 50,
      y: size.height - 50
    }]
  }
  this.setMovePoints = function (size) {
    return [{
        x: 25,
        y: 25
      },
      {
        x: size.width - 25,
        y: 25
      },
      {
        x: 25,
        y: size.height - 25
      },
      {
        x: size.width - 25,
        y: size.height - 25
      }
    ]
  }
  this.adjustMovePoints = function (cropperMovableItems, key, changedTouches, imageInfo) {
    var {
      x,
      y
    } = adjustPoints.call(this, changedTouches, imageInfo)
    var [topLeft, topRight, bottomLeft, bottomRight] = cropperMovableItems

    cropperMovableItems[key].x = x
    cropperMovableItems[key].y = y
    // 同时设置相连两个点的位置，是相邻的两个点跟随着移动点动，保证选框为矩形
    if (key === 0) {
      //向右下方滑行检测

      if (topLeft.y > (bottomLeft.y - 32) && topLeft.x > (bottomRight.x - 32)) {
        topLeft.x = topRight.x - 32
        topLeft.y = bottomLeft.y - 32
        bottomLeft.x = topRight.x - 32
        topRight.y = bottomLeft.y - 32
      } //向下滑行检测
      else if (topLeft.y > (bottomLeft.y - 32) && topLeft.x < (topRight.x - 32)) {
        topLeft.x = x
        topLeft.y = bottomLeft.y - 32
        bottomLeft.x = x
        topRight.y = bottomLeft.y - 32
      }
      //向右滑行
      else if (topLeft.y < (bottomLeft.y - 32) && topLeft.x > (topRight.x - 32)) {
        topLeft.x = topRight.x - 32
        topLeft.y = y
        bottomLeft.x = topRight.x - 32
        topRight.y = y
      } else {
        bottomLeft.x = x
        topRight.y = y
      }
    } else if (key == 1) {
      //向左下方滑行检测
      console.log('右顶点检测==============')

      if (topRight.x < (topLeft.x + 32) && topRight.y > (bottomRight.y - 32)) {
        topRight.x = topLeft.x + 32
        topRight.y = bottomRight.y - 32
        bottomRight.x = topLeft.x + 32
        topLeft.y = bottomRight.y - 32
      }
      //向左检测
      else if (topRight.x < (topLeft.x + 32) && topRight.y < (bottomRight.y - 32)) {
        topRight.x = topLeft.x + 32
        topRight.y = y
        bottomRight.x = topLeft.x + 32
        topLeft.y = y
      }
      //向下检测
      else if (topRight.x > (topLeft.x + 32) && topRight.y > (bottomRight.y - 32)) {
        topRight.x = x
        topRight.y = bottomRight.y - 32
        bottomRight.x = x
        topLeft.y = bottomRight.y - 32
      } else {
        bottomRight.x = x
        topLeft.y = y
      }
    } else if (key == 2) {
      console.log('左下顶点检测=============')
      if (bottomLeft.y < (topLeft.y + 32) && bottomLeft.x > (bottomRight.x - 32)) {
        bottomLeft.x = bottomRight.x - 32
        bottomLeft.y = topLeft.y + 32
        topLeft.x = bottomRight.x - 32
        bottomRight.y = topLeft.y + 32
      } //向右检测
      else if (bottomLeft.y > (topLeft.y + 32) && bottomLeft.x > (bottomRight.x - 32)) {
        bottomLeft.x = bottomRight.x - 32
        bottomLeft.y = y
        topLeft.x = bottomRight.x - 32
        bottomRight.y = y
      } //向上检测
      else if (bottomLeft.y < (topLeft.y + 32) && bottomLeft.x < (bottomRight.x - 32)) {
        bottomLeft.x = x
        bottomLeft.y = topLeft.y + 32
        topLeft.x = x
        bottomRight.y = topLeft.y + 32
      } else {
        topLeft.x = x
        bottomRight.y = y
      }
    } else if (key == 3) {
      console.log('右下顶点检测=============')
      if (bottomRight.x < (bottomLeft.x + 32) && bottomRight.y < (topRight.y + 32)) {
        bottomRight.x = bottomLeft.x + 32
        bottomRight.y = topRight.y + 32
        topRight.x = bottomLeft.x + 32
        bottomLeft.y = topRight.y + 32
      }
      //向左检测
      else if (bottomRight.x < (bottomLeft.x + 32) && bottomRight.y > (topRight.y + 32)) {
        bottomRight.x = bottomLeft.x + 32
        bottomRight.y = y
        topRight.x = bottomLeft.x + 32
        bottomLeft.y = y
      }
      //向上检测
      else if (bottomRight.x > (bottomLeft.x + 32) && bottomRight.y < (topRight.y + 32)) {
        bottomRight.x = x
        bottomRight.y = topRight.y + 32
        topRight.x = x
        bottomLeft.y = topRight.y + 32
      } else {
        topRight.x = x
        bottomLeft.y = y
      }

    }
    return [topLeft, topRight, bottomLeft, bottomRight]
  }

  this.exportCropper = function (cropCallback, cropErrorCallback) {
    let maxX = 0,
      maxY = 0,
      cropperMovableItems = this.data.cropperMovableItems,
      scaleInfo = this.data.cropperData.scaleInfo
    for (let key in cropperMovableItems) {
      let item = cropperMovableItems[key]
      maxX = item.x > maxX ? item.x : maxX
      maxY = item.y > maxY ? item.y : maxY
    }

    var minX = maxX,
      minY = maxY;
    for (let key in cropperMovableItems) {
      let item = cropperMovableItems[key]
      minX = item.x < minX ? item.x : minX
      minY = item.y < minY ? item.y : minY
    }

    var w = maxX - minX,
      h = maxY - minY
    w *= scaleInfo.x
    h *= scaleInfo.y

    var x = minX * scaleInfo.x,
      y = minY * scaleInfo.y

    console.log('crop rect: x=' + x + ',y=' + y + ',w=' + w + ',h=' + h)
    var _this = this
    utils.canvasToTempFilePath({
      x: x,
      y: y,
      width: w,
      height: h,
      destWidth: w,
      destHeight: h,
      canvasId: 'originalCanvas',
      success: function (res) {
        console.log(res, '===res=====')
        let tempFilePath = res.tempFilePath
        cropCallback && cropCallback(tempFilePath)
      },
      fail: function (err) {
        cropErrorCallback && cropErrorCallback(err)
      }
    }, _this)
  }

  // 绘制图形操作点
  this.drawShape = function (callback) {
    try {
      var _this = this
      var {
        cropperBorder,
        cropperMovePoints
      } = _this.data
      var {
        ctx,
        rect
      } = draw.drawLines(_this.moveCtx, _this.data.cropperMovableItems)
      //绘制高亮选中区域
      //绘制选中边框 start
      ctx.setStrokeStyle(cropperBorder.color)
      ctx.setLineWidth(cropperBorder.width)
      ctx.beginPath()
      ctx.moveTo(rect.x, rect.y)
      ctx.lineTo(rect.x + rect.w, rect.y)
      ctx.lineTo(rect.x + rect.w, rect.y + rect.h)
      ctx.lineTo(rect.x, rect.y + rect.h)
      ctx.lineTo(rect.x, rect.y)
      ctx.stroke()
      ctx.closePath()
      //绘制选中边框 end

      //绘制对齐线 start
      cropperBorder.segmentColor && ctx.setStrokeStyle(cropperBorder.segmentColor)
      cropperBorder.segmentWidth && ctx.setLineWidth(cropperBorder.segmentWidth)

      ctx.beginPath()
      ctx.moveTo(rect.x + rect.w / 3, rect.y)
      ctx.lineTo(rect.x + rect.w / 3, rect.y + rect.h)
      ctx.moveTo(rect.x + rect.w / 3 * 2, rect.y)
      ctx.lineTo(rect.x + rect.w / 3 * 2, rect.y + rect.h)

      ctx.moveTo(rect.x, rect.y + rect.h / 3)
      ctx.lineTo(rect.x + rect.w, rect.y + rect.h / 3)

      ctx.moveTo(rect.x, rect.y + rect.h / 3 * 2)
      ctx.lineTo(rect.x + rect.w, rect.y + rect.h / 3 * 2)
      ctx.stroke()
      ctx.closePath()
      //绘制对齐线 end

      // 绘制触摸点 start
      ctx.setFillStyle(cropperMovePoints.color)
      ctx.setStrokeStyle(cropperMovePoints.color)
      ctx.setGlobalAlpha(cropperMovePoints.opacity)
      var len = 13,
        w = 3.0,
        offset = w / 2.0
      ctx.setLineWidth(w)
      ctx.beginPath()
      var x = rect.x
      var y = rect.y
      // 1
      ctx.moveTo(x - offset, y - offset + len)
      ctx.lineTo(x - offset, y - offset)
      ctx.lineTo(x - offset + len, y - offset)
      // 2
      ctx.moveTo(x + offset + rect.w - len, y - offset)
      ctx.lineTo(x + offset + rect.w, y - offset)
      ctx.lineTo(x + offset + rect.w, y - offset + len)
      // 3
      ctx.moveTo(x + offset + rect.w, y + offset + rect.h - len)
      ctx.lineTo(x + offset + rect.w, y + offset + rect.h)
      ctx.lineTo(x + offset + rect.w - len, y + offset + rect.h)
      // 4
      ctx.moveTo(x - offset, y + offset + rect.h - len)
      ctx.lineTo(x - offset, y + offset + rect.h)
      ctx.lineTo(x - offset + len, y + offset + rect.h)

      ctx.stroke()
      ctx.closePath()
      // 绘制触摸点 end

      ctx.draw()
      callback()
    } catch (err) {
      utils.errorFn(err)
    }
  }
}

// 不规则裁剪实现类
function QuadRect() {
  this.setInitMovePoints = function (size) {
    return [{
      x: 50,
      y: 50
    }, {
      x: 50,
      y: 50
    }, {
      x: 50,
      y: size.height - 50
    }, {
      x: size.width - 50,
      y: size.height - 50
    }]
  }

  this.setMovePoints = function (size) {
    return [{
        x: 0,
        y: 0
      },
      {
        x: size.width,
        y: 0
      },
      {
        x: 0,
        y: size.height
      },
      {
        x: size.width,
        y: size.height
      }
    ]
  }

  this.adjustMovePoints = function (cropperMovableItems, key, changedTouches, imageInfo) {
    var {
      x,
      y
    } = adjustPoints.call(this, changedTouches, imageInfo)
    cropperMovableItems[key].x = x
    cropperMovableItems[key].y = y
    // 同时设置相连两个点的位置，是相邻的两个点跟随着移动点动，保证选框为矩形
    return cropperMovableItems
  }

  this.exportCropper = function (cropCallback, cropErrorCallback) {
    try {
      let cropperMovableItems = this.data.cropperMovableItems,
        scaleInfo = this.data.cropperData.scaleInfo
      let res = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0]
      ]
      let points = []
      for (let key in cropperMovableItems) {
        let x = Math.ceil(cropperMovableItems[key].x * scaleInfo.x)
        let y = Math.ceil(cropperMovableItems[key].y * scaleInfo.y)

        var idxLi = {
          0: 0,
          1: 3,
          2: 1,
          3: 2
        }
        res[idxLi[key]] = [x, y]

        points.push({
          x,
          y
        })
      }
      cropperUtils.convexHull(points, points.length)
      cropCallback && cropCallback(res)
    } catch (err) {
      cropErrorCallback && cropErrorCallback(err)
      utils.errorFn(err)
    }
  }
  // 绘制图形操作点
  this.drawShape = function (callback) {
    try {
      var _this = this
      var {
        cropperBorder,
        cropperData,
        cropperMovePoints
      } = _this.data
      var {
        ctx,
        convexDots,
        orderedDots
      } = draw.drawLines(_this.moveCtx, _this.data.cropperMovableItems)

      var canCrop = (convexDots.length === 4)

      /*绘制选中边框 start */
      ctx.setStrokeStyle(canCrop ? cropperBorder.color : 'red') // 如果四个点组成的四边形不是凸四边形，则显示红色，表示不可取
      ctx.setLineWidth(cropperBorder.width)
      ctx.beginPath()
      var draws = [ctx.moveTo, ctx.lineTo, ctx.lineTo, ctx.lineTo]
      var ex = []

      convexDots.forEach((dot, index) => {
        var d = draws[index]
        ex.push({
          x: dot.x + cropperData.itemLength / 2,
          y: dot.y + cropperData.itemLength / 2
        })
        d.call(ctx, dot.x + cropperData.itemLength / 2, dot.y + cropperData.itemLength / 2)
      })
      var dot = convexDots[0]
      ctx.lineTo(dot.x + cropperData.itemLength / 2, dot.y + cropperData.itemLength / 2)
      ctx.stroke()
      ctx.closePath()
      //绘制选中边框 end

      // 绘制触摸点 start
      ctx.setFillStyle(cropperMovePoints.color)
      ctx.setStrokeStyle(cropperMovePoints.color)
      ctx.setGlobalAlpha(cropperMovePoints.opacity)
      orderedDots.forEach(dot => {
        ctx.beginPath()
        ctx.arc(dot.x + cropperData.itemLength / 2, dot.y + cropperData.itemLength / 2, 18, 0, 2 * Math.PI, true)
        ctx.fill()
        ctx.closePath()
      })
      // 绘制触摸点 end

      ctx.draw()
      callback(ctx)
    } catch (err) {
      utils.errorFn(err)
    }
  }
}

// 开放不同模式组件入口
var cropperEntry = function (mode) {
  var modes = {
    [cropperTypes.rect]: new Rect(),
    [cropperTypes.quadRect]: new QuadRect(),
  }
  return modes[mode]
}

export default cropperEntry