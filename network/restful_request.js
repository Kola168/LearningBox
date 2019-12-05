var app = getApp()
import request from './request'

const api = {
  covertInvoiceToPdf: (openId, convertUrls) => request.post(`orders/invoice_url_convert`, {
    openid: openId,
    pdf_urls: convertUrls
  }, {
    baseURL: `${app.apiServer}/ec/v2/`
  }),

  /**
   *授权
   *
   * @param {*} params
   */
  getSession: (params) => request.post(`users/sessions/wechat_decryption`, params, {
    baseURL: `${app.apiServer}/api/v1/`
  }),

  /**
   *证件照合成
   *
   * @param {*} params
   */
  convertId: (params) => request.post(`processes`, params, {
    baseURL: `${app.apiServer}/api/v1/`
  }),

  /**
   *智能证件照搜索
   *
   * @param {*} search 关键词
   */
  searchId: (search) => request.get(`certificate_photo_types`, {
    search
  }, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
}

export default api