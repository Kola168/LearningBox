import {
  cropperTypes
} from './config'


/**
 * 裁剪组件
 * @param {Object} croppers 裁剪模板信息
 *    @param0 {Object} tempInfo 模板尺寸信息
 *    @param1 {String} mode 裁剪模式
 *    
 * @param {Object} cropperMovePoints 移动点样式
 * @param {Object} cropperBorder 中间分割线样式
 */



export default {
  //裁剪模板信息
  croppers: {
    type: Object,
    value: {
      tempInfo: {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
      },
      mode: cropperTypes.rect
    },
    observer: function (newVal, oldVal) {
      this.setData({
        croppers: newVal
      })
      newVal && this.initCropperTemps(newVal)
    }
  },
  // 四个点位显示信息
  cropperMovePoints: {
    type: Object,
    value: {
      color: '#ffe27a',
      width: 10,
      height: 10,
      opacity: 0.7
    }
  },
  // 边框信息
  cropperBorder: {
    type: Object,
    value: {
      width: 2, //宽度
      color: '#ffe27a', //色值
      segmentColor: '#fff', //分割线颜色
      segmentWidth: 1, //分割线宽度
    }
  }
}