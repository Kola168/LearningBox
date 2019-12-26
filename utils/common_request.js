import { regeneratorRuntime, co } from './common_import'
import getLoopsEvent from './worker'
import graphql from '../network/graphql_config'
import api from '../network/restful_request'
/**
 * 创建订单
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
    duplex: Boolean 是否双面打印
 * }
 */
const createOrder = function(featureKey, fileAttributes) {
  return graphql.mutate({
    mutation: `mutation ($input: CreateOrderInput!){
      createOrder(input:$input){
        state
      }
    }`,
    variables: {
      input: {
        featureKey: featureKey,
        fileAttributes: fileAttributes
      }
    }
  })
}

const previewDocument = co.wrap(function*(data, callback) {
  getLoopsEvent(data, (result) => {
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

/**
 * 获取打印机能力
 * @param { String } featureKey required
 * @returns {
  borderless 是否无边距
  grayscale 是否支持灰度
  color 是否是彩色打印机
  highQuality 是否支持高质量
  duplex 是否支持双面打印
* }
*/

const getPrinterCapacity = co.wrap(function*(featureKey, fileUrl) {
  let capacity = yield graphql.query({
    query: `query($featureKey: String!) {
      currentUser{
        selectedDevice {
          capability(featureKey:$featureKey) {
            borderless
            color
            highQuality
            duplex
          }
        }
      }
    }`,
    variables: {
      featureKey: featureKey
    }
  })
  capacity = capacity.currentUser && capacity.currentUser.selectedDevice.capability
  capacity.grayscale = true
  if (fileUrl) {
    let fileObj = yield api.synthesisWorker({
      feature_key: featureKey,
      url: fileUrl,
      is_async: false
    })

    capacity = Object.assign({
      pageCount: fileObj.res.pages
    }, capacity)
  }
  return capacity
})


module.exports = {
  createOrder,
  getPrinterCapacity,
  previewDocument,
}