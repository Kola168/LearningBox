const app = getApp()
import { regeneratorRuntime, co, util } from './common_import'
import getLoopsEvent from './worker'
import graphql from '../network/graphql_config'
import api from '../network/restful_request'
import Logger from './logger.js'
const logger = new Logger.getLogger('common_request')
import storage from './storage'


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

/**
 * 文档预览
 * @param {Object} data 生成文档预览的参数
 * @param {Function} callback 生成文档预览的参数
 * @
 */
const previewDocument = co.wrap(function*(data, callback) {
  var previewDoc = function(converted_url, callback) {
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

  getLoopsEvent(data, (result) => {
    if (result.status == 'finished') {
      var converted_url = result.data.converted_url
      previewDoc(converted_url, callback)
    }
  }, ()=>{
    callback()
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
  capacity = capacity.currentUser && capacity.currentUser.selectedDevice && capacity.currentUser.selectedDevice.capability || {}
  capacity.grayscale = true

  if (fileUrl) {
    try {
      let fileObj = yield api.synthesisWorker({
        feature_key: featureKey,
        url: fileUrl,
        is_async: false
      })
      if (fileObj.res && fileObj.res.pages) {
        capacity = Object.assign({
          pageCount: fileObj.res.pages
        }, capacity)
      }

    } catch(err){
      util.showError(err)
    }

  }
  return capacity

})

/**
 * 支付统一下单
 * @param { String } sn required 资源/课程...sn
 * @param { String } orderType 订单类型member/course
 *
 */

const createPaymentOrder = co.wrap(function*(sn, orderType){
  return yield graphql.mutate({
    mutation: `mutation ($input: CreatePaymentOrderInput!){
      createPaymentOrder(input:$input){
        paymentOrder{
          sn
          state
          amountYuan
          updatedAt
          createdAt
          payable {
            ...on Course{
              iconUrl
              desc
              totalLessons
            }
            ...on MemberConfig{
              sn
              displayPriceY
              name
              priceY
              afterRechargeDate
              image
            }
          }
        }
      }
    }`,
    variables: {
      input: {
        sn: sn,
        type: orderType
      }
    }
  })
})

/**
 * @param { String } sn required 订单sn
 * @param { Function } success callback
 * @param { Function } fail callback
 */
const emptyFn = function emptyFn() {}
const createPayment = co.wrap(function*(sn, success=emptyFn, fail=emptyFn){
  try {
    let paymentResp = yield graphql.mutate({
      mutation: `mutation ($input: CreatePaymentInput!){
        createPayment(input:$input){
          payParams{
            ...on WxpayParams {
                nonceStr
                package
                paySign
                signType
                timeStamp
            }
          }
        }
      }`,
      variables: {
        input: {
          paymentOrderSn: sn,
          paymentMethod: "wechat_miniapp"
        }
      }
    })
    wx.requestPayment({
      ...paymentResp.createPayment.payParams,
      success(res){
        success(res)
      },
      fail(error){
        logger.info(error.errMsg)
        let isCancel = error.errMsg.indexOf('cancel')>-1
        fail(isCancel,{
          message: error.errMsg
        })
      }
    })
  } catch (error) {
    logger.info(error)
    fail(false,error)
  }
})

/**
 * @param { String } openid
 * @param { Object } encrypted_info 解密详细信息
 * @param { String } decr_type 解密方式
 */const phoneDecrypt =  co.wrap(function* (e) {
	try {
		let params = {
			openid: app.openId,
			encrypted_info: {
				encrypted_data: encodeURIComponent(e.detail.encryptedData),
				iv: encodeURIComponent(e.detail.iv),
			},
			decr_type: 'mobile'
		}
		const resp = yield api.wechatDecryption(params)
		if (resp.code == 0) {
			storage.put("phoneNum", resp.res.sn)
      return true
		} else {
			throw (resp)
		}
	} catch (e) {
    throw (e)
		return false
	}
})

module.exports = {
  createOrder,
  getPrinterCapacity,
  previewDocument,
  createPaymentOrder,
	createPayment,
	phoneDecrypt
}
