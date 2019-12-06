const app = getApp()
import { regeneratorRuntime, co, storage, util } from './common_import'
const request = util.promisify(wx.request)
import getLoopsEvent from './worker'
import api from '../network/restful_request'
/**
 * 打印接口
 * @param { Object } params required
 */
const printOrders = co.wrap(function*(params = {}) {
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
  return {
    code: 0,
    res: {}
  }
})

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


const previewDocument = co.wrap(function*(data, callback){
  getLoopsEvent(data, (result)=>{
    console.log(result,'==result==')
    if (result.status == 'finished') {
      var converted_url = result.data.converted_url
      wx.downloadFile({
        url: converted_url,
        success:(res)=>{
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
  printOrders,
  getPrinterCapacity,
  previewDocument,
}