import {
  env,
  logError
} from './config'

function errorFn(e) {
  logError && console.log('==抛出了异常问题==', e)
}

// promise
function p(fn) {
  return function (options) {
    options.success = options.success ? options.success : function (res) {}
    options.fail = options.fail ? options.fail : function (err) {}
    return new Promise((resolve, reject) => {
      var success = options.success
      var fail = options.fail
      var _this = this
      options.success = function (obj) {
        success.apply(_this, obj)
        resolve(obj)
      }
      options.fail = function (err) {
        fail.apply(_this, err)
        reject(err)
      }
      fn(options)
    })
  }
}
// 异常组合函数
function wrapException(run = () => {}, error) {
  var _this = this
  return function (...args) {
    try {
      return run.apply(_this, args)
    } catch (err) {
      error && error.apply(_this)
      errorFn(err)
    }
  }
}

//  封装不同平台 wx ali baidu & api
var showToast = wrapException(function (obj) {
  var toast = {
    wx: wx && p(wx.showToast),
    // ax: 
  }
  return toast[env].call(this, obj)
})

var getImageInfo = wrapException(function (obj) {
  var getImg = {
    wx: wx && p(wx.getImageInfo),
    // ax:
  }
  return getImg[env].call(this, obj)
})

var canvasToTempFilePath = wrapException(function () {
  var args = [].slice.call(arguments)
  var canvas = {
    wx: wx && wx.canvasToTempFilePath,
    // ax:
  }
  return canvas[env](...args)
})



export default {
  showToast,
  getImageInfo,
  canvasToTempFilePath,
  errorFn,
}