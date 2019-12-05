const regeneratorRuntime = require('../lib/co/runtime')
const co = require('../lib/co/co')
const util = require('../util')
const request = util.promisify(wx.request)
const app = getApp()

var workerId //定义的loop状态
var time = 3000 //单次查询时间3s
const MAX_TIME = 60000 //处理最长时间60s
var removeTimer = function (_id) {
  _id && clearTimeout(_id)
}

/**
 * @methods 换取worker sn
 * @param {String} 处理方法sn
 * @param {Object} 具体处理函数所需的数据
 */

const getWorkerSn = co.wrap(function*(handle, worker_data={}) {
  try {
    const resp = yield request({
      url: app.apiServer + '/boxapi/v2/workers',
      method: 'POST',
      dataType: 'json',
      data: {
          handle,
          worker_data,
      }
    })
    if (resp.data.code != 0) {
      throw (resp.data)
    }
    if (resp.data && resp.data.res) {
      return resp.data.res.sn
    } 
  }catch(err) {
  }
})


/**
 * @methods sn换取具体处理完成的值
 * @param {String} *sn
 */

const getWorkerResult = co.wrap(function*(sn) {
  try {
    const resp = yield request({
      url: app.apiServer + '/boxapi/v2/workers',
      method: 'POST',
      dataType: 'json',
      data: {
          handle,
          worker_data,
      }
    })
    if (resp.data.code != 0) {
      throw (resp.data)
    }
    if (resp.data && resp.data.res) {
      return resp.data.res.sn
    } 
  } catch(err) {
    util.showErr(err)
  }
})

/**
 * @methods sn换取具体处理完成的值
 * @param {Object} *worker 处理数据
 * @param {Function} 单次触发的回调 
 * @param {Function} 触发抛出错误回调
 */
const getLoopsEvent = co.wrap(function*(data, triggerCallbackFn = function(){}, triggerError = function(){}){
  try {
    var enterTime = (new Date()) //初始化时间
    var sn = yield getWorkerSn(data.handle, data.worker_data)

    var counter = function() {
      workerId = setTimeout(co.wrap(function*() {
        var carryTime = (new Date()) //执行时间
        var workers = yield getWorkerResult(sn) //获取worker结果
        if (carryTime  - enterTime > MAX_TIME) {
          triggerCallbackFn({
            status: 'timeout',
            message: '图片处理超时, 请重新尝试!'
          })
          return removeTimer(workerId) //关闭定时器
        }
  
        if (res.state === 'processing') { //处理中
           triggerCallbackFn({
            status: 'processing',
            message: ''
          })
          return counter()
        } 
  
        removeTimer(workerId) //关闭定时器
        if (workers.state === 'finished') {
          triggerCallbackFn({
            data: workers.worker_data,
            status: 'finished',
            message: ''
          })
        } else if (workers.state === 'failed') {
          triggerCallbackFn({
            status: 'failed',
            message: '绘制有误'
          })
        } 

      }), time)
    }
    counter()

  } catch(err) {
    triggerError  && triggerError(err)
  }
})

export default getLoopsEvent