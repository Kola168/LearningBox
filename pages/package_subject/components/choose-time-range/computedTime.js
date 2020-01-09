
import config from './config'


var formatNum = function(num) {
  return num < 10 ? '0' + num : num
}

var timestampToDate = function(timestamp) {
  var d = new Date(timestamp)
  var yyyy = d.getFullYear()
  var mm = formatNum(d.getMonth() + 1) 
  var dd = formatNum(d.getDate())
  return yyyy + '-' + mm + '-' + dd
}


var dateToTimestamp = function(date) {
  var timestamp = date.replace(/-/g, '/')
  var d = new Date(timestamp)
  return d.getTime()
}

/**
 * 获取当前时间日期
 */
var getCurrentDate = function () {
  var timeStamp = (new Date()).getTime()
  return timestampToDate(timeStamp)
}

/**
 * 获取最近指定范围的时间戳
 * @param {*} range min 0
 */
var getNearStipTimestamp = function(range) {
  var d = getCurrentDate() //获取当前时间
  var dayTimestamp = 60 * 1000 * 60 * 24 //一天的时间戳
  var rangeTimestampDiff = dateToTimestamp(d) - (range * dayTimestamp) 
  return rangeTimestampDiff  //返回指定时间日期的时间戳
}

/**
 * 
 * @param {Number} range 指定的时间范围 
 */
var getCurrentDayToDayFn = function(range) {
 try {
  if (typeof range !='number') {
    throw 'range value must be Int';
  }
  var timestamp = getNearStipTimestamp(range)
  var endDateTimestamp = dateToTimestamp(getCurrentDate())
  return {
    startDate: timestampToDate(timestamp),
    endDate: timestampToDate(endDateTimestamp)
  }
 } catch(err) {
   throw err
 }
}



/**
 * 获取指定日期的时间范围
 * @param {*} appoint 
 */
var getAssignDate = function (appoint) {
  var appointList = config.appointList
  var range = appointList[appoint].range
  if (typeof range != 'undefined') {
    var timestamp = getNearStipTimestamp(range)
    return {
      startDate: timestampToDate(timestamp),
      endDate: timestampToDate(timestamp)
    }
  }
}


export default {
  getAssignDate,
  getCurrentDayToDayFn
}



