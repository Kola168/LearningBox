import cropperUtils from './cropperUtils'
/**
 * @methods 绘制边框
 * @param {*} ctx  当前绘图上下文
 * @param {*} cropperMovableItems  裁剪触摸点坐标
 */
var drawLines = function (ctx, cropperMovableItems) {
  var convexDots = []
  var orderedDots = cropperMovableItems

  // 获取凸边形的点
  convexDots = cropperUtils.convexHull(orderedDots, orderedDots.length)

  //绘制高亮选中区域
  var rect = cropperUtils.getCropRect(convexDots)

  return {
    ctx,
    rect,
    convexDots,
    orderedDots
  }
}

/**
 * @methods 绘制图片
 * @param {*} cropperData 
 * @param {*} cropperChangeableData 
 * @param {*} imageInfo 
 */
var drawImage = function (originalCanvasCtx, cropperData, cropperChangeableData, imageInfo) {
  if (imageInfo.path) {
    var path = imageInfo.path
    var compressedScale = cropperData.original ? 1.0 : 0.4
    var rotateDegree = cropperChangeableData.rotateDegree
    //绘制原图
    cropperUtils.drawImageWithDegree(
      originalCanvasCtx,
      path,
      imageInfo.width * compressedScale,
      imageInfo.height * compressedScale,
      rotateDegree
    )
  }
}

export default {
  drawLines,
  drawImage
}