import { 
  regeneratorRuntime,
  co,
  util
 } from "../../../utils/common_import"

import commonRequest from '../../../utils/common_request'
import graphqlSubject from '../../../network/graphql/subject'
import graphql from '../../../network/graphql_request'
var baseSetting = {

}

var printTypes = {
  doc: 'PRINTDOC', //文档类
  subject: 'PRINTSUBJECT', //学科类
  resource: 'RESOURCE', //资源类
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


var createOrder = co.wrap(function *(createPms) {
  try {
    var { printType, featureKey, params } = createPms
    var printOrder =  {
      /**
       * @param  {String} featureKey
       * @param  {Object} attributes
          originalUrl
          printUrl
          copies: Int = 1 打印份数
          grayscale: Boolean 是否使用灰度打印
          startPage: Int 开始页数
          endPage: Int 结束页数
          filename: String 文件名
          singlePageLayoutsCount: Int 单页布局数量
          extract: String = "all" 奇偶数打印 all odd even
          skipGs: Boolean = false 是否跳过gs强制转换
          duplex: Boolean 是否双面打印
       */
      [printTypes.doc]: co.wrap(function *(featureKey, params) {
        var resp = yield commonRequest.createOrder(featureKey, params)
        return resp.createOrder
      }),
      /**
       * @param  {String} featureKey
       * @param  {Object} attributes
          sn 所属的sn
          resourceType 资源类型 
          capabilitys  打印机支持参数
          ... 自定义的扩展参数
       */
      [printTypes.subject]: co.wrap(function *(featureKey, params) {
        var resp = yield graphqlSubject.createXuekewangOrder({featureKey, attributes: Object.assign({
          ...params.attributes,
          ...params.capabilitys
        })})
        return resp.createXuekewangOrder
      }),

      /**
       * @param  {String} featureKey
       * @param  {Object} resourceAttribute
          sn 所属的sn
          resourceType 资源类型 
          capabilitys  打印机支持参数
          ... 自定义的扩展参数
       * @param  {String} resourceOrderType
       */
      [printTypes.resource]: co.wrap(function *(featureKey, params) {
       try {
        var resp = yield graphql.createResourceOrder({
          featureKey,
          resourceAttribute: Object.assign({
            ...params.resourceAttribute,
            ...params.capabilitys,
          }),
          resourceOrderType: params.resourceOrderType,
        })
        return resp.createXuekewangOrder
       } catch(err) {
         console.log(err)
       }
      }),
    }
    var resp =  yield printOrder[printType](featureKey, params)
    return resp
  } catch(err) {

  }
})

var printConfig = {
  baseSetting, 
  printTypes,
  getPrinterCapability,
  createOrder
}

export default printConfig