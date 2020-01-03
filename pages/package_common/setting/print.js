import { 
  regeneratorRuntime,
  co,
  util
 } from "../../../utils/common_import"

import commonRequest from '../../../utils/common_request'
import graphql from '../../../network/graphql/subject'
var baseSetting = {

}


var printTypes = {
  doc: 'PRINTDOC', //文档类
  subject: 'PRINTSUBJECT', //学科类
}

var printTypeMap = [
  printTypes.doc
]

var getPrinterCapability = co.wrap(function* (orderPms) {
  try {
    var url = printTypeMap.indexOf(orderPms.printType) > -1 ? orderPms.url : ''
    var printterCapacity = yield commonRequest.getPrinterCapacity(orderPms.featureKey, url) //获取打印能力数据
    return printterCapacity
  } catch (err) {
    console.log(err)
    util.showError(err)
  }
})


var createOrder = co.wrap(function *(printType, featrueKey, params) {
    var printOrder =  {
      
      [printTypes.doc]: co.wrap(function *(featrueKey, params) {
        var resp = yield commonRequest.createOrder(featrueKey, params)
        return resp.createOrder
      }),

      [printTypes.subject]: co.wrap(function *(featrueKey, params) {
        var resp = yield graphql.createXuekewangOrder({featrueKey, attributes: params})
        return resp.createXuekewangOrder
      }),
    }
    var resp =  yield printOrder[printType](featrueKey, params)
    return resp
})

var printConfig = {
  baseSetting, 
  printTypes,
  getPrinterCapability,
  createOrder
}

export default printConfig