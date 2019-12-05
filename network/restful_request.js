var app = getApp()
import request from './request'

const api = {
  covertInvoiceToPdf: (openId, convertUrls) => request.post(`orders/invoice_url_convert`, {
    openid: openId,
    pdf_urls: convertUrls
  }, {
    baseURL: `${app.apiServer}/ec/v2/`
  }),
  getSession: (params) => request.post(`users/sessions/wechat_decryption`, params, {
    baseURL: `${app.apiServer}/api/v1/`
  })

}

export default api