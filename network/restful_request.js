/*
 * @Author: your name
 * @Date: 2019-12-05 11:13:26
 * @LastEditTime: 2019-12-05 11:17:58
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/network/restful_request.js
 */
var app = getApp()
import request from './request'

const api = {
  covertInvoiceToPdf: (openId, convertUrls) => request.post(`orders/invoice_url_convert`, {
    openid: openId,
    pdf_urls: convertUrls
  }, {
    baseURL: `${app.apiServer}/ec/v2/`
  }),
 
	wechatDecryption: (params) => request.post(`users/sessions/wechat_decryption`, params, {
    baseURL: `${app.apiServer}/api/v1/`
  })

}

export default api