const regeneratorRuntime = require('../lib/co/runtime')
const co = require('../lib/co/co')
const util = require('./util')
import api from '../network/restful_request'
const app = getApp()

var workerId //定义的loop状态
var time = 3000 //单次查询时间3s
const MAX_TIME = 600000 //处理最长时间60s
var removeTimer = function (_id) {
  _id && clearTimeout(_id)
}

/**
 * @methods 换取worker sn
 * @param {String} 处理方法sn
 * @param {Object} 具体处理函数所需的数据
 */

const getWorkerSn = co.wrap(function*(feature_key, worker_data={}) {
  try {
    const resp = yield api.synthesisWorker({
      is_async: true,
      feature_key,
      ...worker_data
    })
    if (resp.code != 0) {
      throw (resp)
    }
    if (resp && resp.res) {
      return resp.res.sn
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
    const resp = yield api.synthesisSnResult(sn)
    if (resp.code != 0) {
      throw (resp)
    }
    if (resp && resp.res) {
      return resp.res
    }
  } catch(err) {
    util.showError(err)
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
    var sn = yield getWorkerSn(data.feature_key, data.worker_data)
    try {

      var counter = function() {
        workerId = setTimeout(co.wrap(function*() {
          var carryTime = (new Date()) //执行时间
          var workers = yield getWorkerResult(sn) //获取worker结果
          if(!workers) {
            triggerError()
          }
          if (carryTime  - enterTime > MAX_TIME) {
            triggerCallbackFn({
              status: 'timeout',
              message: '图片处理超时, 请重新尝试!'
            })
            return removeTimer(workerId) //关闭定时器
          }


          if (workers && workers.state === 'send') { //处理中
             triggerCallbackFn({
              status: 'processing',
              message: ''
            })
            return counter()
          }

          removeTimer(workerId) //关闭定时器
          if (workers && workers.state === 'finished') {
            if(data.feature_key=='cert_id'){
              workers.sn=sn
            }
            triggerCallbackFn({
              data: workers,
              status: 'finished',
              message: ''
            })
          }

        }), time)
      }
      counter()
    } catch (err) {
      removeTimer(workerId) //接口异常时 关闭定时器
    }

  } catch(err) {
    triggerError  && triggerError(err)
  }
})

export default getLoopsEvent
