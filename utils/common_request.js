import { regeneratorRuntime, co } from './common_import'
import getLoopsEvent from './worker'
import graphql from '../network/graphql_request'

/**
 * 创建订单订单
 * @param { String } featureKey required 对应功能的key
 * @param { Array } fileAttributes required 需要打印的文件列表
 * ArrayItem {
 *  originalUrl: String required 用户上传的原文件
    printUrl: String 编辑后可打印的连接
    copies: Int = 1 打印份数
    grayscale: Boolean 是否使用灰度打印
    startPage: Int 开始页数
    endPage: Int 结束页数
    filename: String 文件名
    singlePageLayoutsCount: Int 单页布局数量
    extract: String = "all" 奇偶数打印 all odd even
    skipGs: Boolean = false 是否跳过gs强制转换
 * }
 */
const createOrder = function(featureKey, fileAttributes) {
  return graphql.createOrder({
    featureKey,
    fileAttributes
  })
}

/**
 * 获取打印机能力
 * @param { Object } params required
 */

const getPrinterCapacity = co.wrap(function*(params = {}) {
  // let authToken = storage.get('authToken')
  // let resp = yield request({
  //   url: UPLOAD_AUTH_URL,
  //   header: {
  //     'AUTHORIZATION': `Token token=${authToken}`
  //   },
  //   method: 'GET',
  //   dataType: 'json',
  //   data: params
  // })
  // let authInfo = resp.data.res
  // if (resp.data.code != 0) {
  //   throw (authInfo)
  // }
  let res = { "code": 0, "print_capability": { "color_modes": ["Color", "Mono"], "page_count": 29, "media_sizes": [{ "media_size": 0, "media_name": "A4文件", "duplex": true }, { "media_size": 3, "media_name": "A5文件", "duplex": false }] } }
  return res.print_capability
})


const previewDocument = co.wrap(function*(data, callback) {
  getLoopsEvent(data, (result) => {
    console.log(result, '==result==')
    if (result.status == 'finished') {
      var converted_url = result.data.converted_url
      wx.downloadFile({
        url: converted_url,
        success: (res) => {
          callback()

          wx.openDocument({
            filePath: res.tempFilePath
          })
        }
      })
    }
  })
})


module.exports = {
  createOrder,
  getPrinterCapacity,
  previewDocument,
}