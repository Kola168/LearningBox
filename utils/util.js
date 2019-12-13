const Promise = require('../lib/es6-promise/es6-promise').Promise;
const _ = require('../lib/underscore/we-underscore')


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function _getRotateDirection(vector1, vector2) {

  return vector1.x * vector2.y - vector2.x * vector1.y;

}

function _getDistance(xLen, yLen) {
  return Math.sqrt(xLen * xLen + yLen * yLen);
}

function _getRotateAngle(vector1, vector2) {

  let direction = this._getRotateDirection(vector1, vector2);

  direction = direction > 0 ? -1 : 1;

  let len1 = this._getDistance(vector1.x, vector1.y);

  let len2 = this._getDistance(vector2.x, vector2.y);

  let mr = len1 * len2;

  if (mr === 0) return 0;

  let dot = vector1.x * vector2.x + vector1.y * vector2.y;

  let r = dot / mr;

  if (r > 1) r = 1;

  if (r < -1) r = -1;

  return Math.acos(r) * direction * 180 / Math.PI;
}

function _convert_to_redians(degrees) {
  return degrees * Math.PI / 180;
}

function _getLeftPoint(point, publicScale, img_width, img_height, template_x, template_y, template_scale) {
  let point_left_top = {
    x: point.x + img_width * publicScale / 2 + template_x / template_scale,
    y: -point.y + img_height * publicScale / 2 + template_y / template_scale
  };
  return point_left_top
}

function _getPoint(arrayX, arrayY) {
  let min = Math.min.apply(null, arrayX)
  let max = Math.max.apply(null, arrayY)
  console.log(arrayX)
  console.log(arrayY)
  let point = {
    x: min,
    y: max
  };
  return point;
}

function _getCoordinates(angle, scale, width, height) {
  let point_left_top = {
    x: (-width / 2) * scale * Math.cos(_convert_to_redians(angle)) + (height / 2) * scale * Math.sin(_convert_to_redians(angle)),
    y: (height / 2) * scale * Math.cos(_convert_to_redians(angle)) - (-width / 2) * scale * Math.sin(_convert_to_redians(angle))
  };

  let point_right_top = {
    x: (width / 2) * scale * Math.cos(_convert_to_redians(angle)) + (height / 2) * scale * Math.sin(_convert_to_redians(angle)),
    y: (height / 2) * scale * Math.cos(_convert_to_redians(angle)) - (width / 2) * scale * Math.sin(_convert_to_redians(angle))
  };

  let point_left_bottom = {
    x: (-width / 2) * scale * Math.cos(_convert_to_redians(angle)) + (-height / 2) * scale * Math.sin(_convert_to_redians(angle)),
    y: (-height / 2) * scale * Math.cos(_convert_to_redians(angle)) - (-width / 2) * scale * Math.sin(_convert_to_redians(angle))
  };

  let point_right_bottom = {
    x: (width / 2) * scale * Math.cos(_convert_to_redians(angle)) + (-height / 2) * scale * Math.sin(_convert_to_redians(angle)),
    y: (-height / 2) * scale * Math.cos(_convert_to_redians(angle)) - (width / 2) * scale * Math.sin(_convert_to_redians(angle))
  };

  let arr = new Array();
  arr[0] = point_left_top;
  arr[1] = point_right_top;
  arr[2] = point_left_bottom;
  arr[3] = point_right_bottom;
  return arr;
}

function _getPointArray(array) {
  let arrX = new Array();
  arrX[0] = array[0].x;
  arrX[1] = array[1].x;
  arrX[2] = array[2].x;
  arrX[3] = array[3].x;

  let arrY = new Array();
  arrY[0] = array[0].y;
  arrY[1] = array[1].y;
  arrY[2] = array[2].y;
  arrY[3] = array[3].y;
  return _getPoint(arrX, arrY);
}

// 角度锁定
function _snapToAngle(rotation, angle, distance_angle) {
  rotation = rotation % 360;
  if (rotation < 0) {
    rotation = 360 + rotation;
  }

  var yu = rotation % angle;
  if (yu > 0 && yu < distance_angle) {
    rotation = rotation - yu;
  }
  var tmp = angle - yu;
  if (tmp > 0 && tmp < distance_angle) {
    rotation = rotation + tmp;
  }

  if (rotation > 180) {
    rotation = rotation - 360
  }

  return parseInt(rotation);
}

// 全幅裁切模式适应
function _getSuiteValues(imgWidth, imgHeight, areaWidth, areaHeight) {
  var w1 = imgWidth;
  var h1 = imgHeight;
  var w0 = areaWidth;
  var h0 = areaHeight;
  // 0 是相框
  if (w1 / h1 <= w0 / h0) { // 图片的宽长比小于像框的，就是竖着的
    var scale = w0 / w1;
    return {
      width: w0,
      height: scale * h1,
      scale: scale,
      orientation: 1,
      top: -(scale * h1 - h0) / 2,
      left: 0
    };
  } else if (w1 / h1 > w0 / h0) { // 横着的
    var scale = h0 / h1;
    return {
      width: scale * w1,
      height: h0,
      scale: scale,
      orientation: 0,
      left: -(w1 * scale - w0) / 2,
      top: 0
    };
  }
}

// 留白模式适应
function _getSuiteValuesFull(imgWidth, imgHeight, areaWidth, areaHeight) {
  var w1 = imgWidth;
  var h1 = imgHeight;
  var w0 = areaWidth;
  var h0 = areaHeight;
  // 0 是相框
  if (w1 / h1 <= w0 / h0) { // 图片的宽长比小于像框的，就是竖着的
    var scale = h0 / h1;
    return {
      width: scale * w1,
      height: h0,
      scale: scale,
      orientation: 1,
      top: 0,
      left: (w0 - w1 * scale) / 2
    };
  } else if (w1 / h1 > w0 / h0) { // 横着的
    var scale = w0 / w1;
    return {
      width: w0,
      height: scale * h1,
      scale: scale,
      orientation: 0,
      left: 0,
      top: (h0 - h1 * scale) / 2
    };
  }
}

function promisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}

function showError(e) {
  let title, content
  if (e && e.message) {
    title = e.title || '提示'
    content = e.message
  } else if (e && e.errors && e.errors[0]) {
    content = e.errors[0].message || ''
  }
  wx.showModal({
    title: title || '提示',
    content: content || '网络异常',
    showCancel: false,
    confirmColor: '#2086ee'
  })
}

function deleteItem(array, item) {
  Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == val) return i;
    }
    return -1;

  };
  Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {

      this.splice(index, 1);
    }
  };
  return array.remove(item)

}

//过滤不可打印的文档
function clearFile(array) {
  let tempArray = _(array).clone()
  for (var i = 0; i < tempArray.length; i++) {
    if (tempArray[i].name.match(/\.(doc|docx|ppt|pptx|pdf|xls|xlsx)$/i)) {
      if (((tempArray[i].size) / 1024 / 1024) > 50) {
        deleteItem(array, tempArray[i])
      }
    } else {
      deleteItem(array, tempArray[i])
    }
  }
  return array
}

function compareVersion(v1, v2) { //兼容性比较
  v1 = v1.split('.')
  v2 = v2.split('.')
  var len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (var i = 0; i < len; i++) {
    var num1 = parseInt(v1[i])
    var num2 = parseInt(v2[i])

    if (num1 > num2) {
      return true
    } else if (num1 < num2) {
      return false
    }
  }
  return false
}

//删除数组某一项元素
function deleteOneId(array, item) {
  Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == val) return i;
    }
    return -1;
  };
  Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
      this.splice(index, 1);
    }
  };
  return array.remove(item)
}

//发票打印只保留pdf文档
function clearPdfFile(array) {
  let tempArray = _(array).clone()
  for (var i = 0; i < tempArray.length; i++) {
    let names = tempArray[i].name.split('.')
    let name = names[names.length - 1].toLowerCase()
    if (name == 'pdf') {
      if (((tempArray[i].size) / 1024 / 1024) > 50) {
        deleteItem(array, tempArray[i])
      }
    } else {
      deleteItem(array, tempArray[i])
    }
  }
  return array
}

/**
 * @methods  处理文件名
 * @param {Array} files 文件列表
 */
function resetFiles(file = '') {
  const reg = /([^\/\\]+)\.+([a-z]+)$/i;
  const newfile = reg.exec(file);
  let newFiles = {
    name: newfile[1],
    suffix: newfile[2]
  }
  return newFiles;
}

/**
 * @methods 获取字符串字节
 * @param {String} val
 * @returns {Number}
 */

function getStringByte(val) {
  let str = new String(val),
    bytesCount = 0
  for (var i = 0, n = str.length; i < n; i++) {
    let c = str.charCodeAt(i)
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      bytesCount += 1
    } else {
      bytesCount += 2
    }
  }
  return bytesCount
}

module.exports = {
  promisify: promisify,
  _getRotateDirection: _getRotateDirection,
  _getDistance: _getDistance,
  _getRotateAngle: _getRotateAngle,
  _getPointArray: _getPointArray,
  _getCoordinates: _getCoordinates,
  _getLeftPoint: _getLeftPoint,
  _snapToAngle: _snapToAngle,
  _getSuiteValues: _getSuiteValues,
  _getSuiteValuesFull: _getSuiteValuesFull,
  clearFile: clearFile,
  compareVersion: compareVersion,
  deleteOneId: deleteOneId,
  clearPdfFile: clearPdfFile,
  resetFiles: resetFiles,
  showError: showError,
  deleteItem: deleteItem,
  getStringByte:getStringByte
}
