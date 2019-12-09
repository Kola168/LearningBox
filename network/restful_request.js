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
 
	wechatDecryption: (params) => request.post(`users/sessions/wechat_decryption`, params, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
   //资源分享签到
  shareResource: () => request.post(`users/share_resource`, {
  }, {
    baseURL: `${app.apiServer}/boxapi/v2/`
  }),
   //convert invoice to pdf
  covertInvoiceToPdf: (convertUrls) => request.post(`orders/invoice_url_convert`, {
    pdf_urls: convertUrls
  }, {
    baseURL: `${app.apiServer}/ec/v2/`
  }),
  smartConvert: (img_url) => request.post(`reprographics/smart_convert`, {
    img_url
  }, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
  // 获取资源列表
  getResourceCategories: (sn, params) => request.get(`resource_categories/${sn}`, params, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
  // 发起预支付
  toPrePay: (params) => request.post(`/resources/prepay`, params, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
  // 获取发票详情信息
  getInvoiceInfo: (params) => request.post(`processes`, {
    is_async: false,
    feature_key: 'invoice',
    ...params
  }, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
  // 合成任务机
  synthesisWorker: (params) => request.post(`processes`, params, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
  // sn 换取worker res
  synthesisSnResult: (sn) => request.get(`processes/${sn}`, {}, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
  // 复印合成图片
  multiConvert: (params)=> request.post(`processes`, {
    is_async: false,
    feature_key: 'reprography',
    ...params
  }, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
  copyConvert: (params) => request.post(`reprographics/point_edit`, params, {
      baseURL: `${app.apiServer}/api/v1/`
  }),
  processes:(params)=>request.post(`processes`,params, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
  // 收藏
  collectCourse: (openId, sn, type) => request.post(`collections/${openId}/create`, {
    sn: sn,
    type: type
  }, {
    baseURL: `${app.apiServer}/boxapi/v2/`
  }),

  // 取消收藏
  deleteCollectCourse: (openId, sn, type) => request.post(`collections/${openId}/delete`, {
    sn: sn,
    type: type
  }, {
    baseURL: `${app.apiServer}/boxapi/v2/`
  }),
  // 发起助力
  sendAssistance: (sn) => request.post(`/boxapi/v2/course_base/assistance/${sn}`, {}, {
    baseURL: `${app.apiServer}/boxapi/v2/`
  }),
  // 获取分享助力信息
  getShareAssistance: (sn) => request.get(`/boxapi/v2/course_base/share/${sn}`, {}, {
    baseURL: `${app.apiServer}/boxapi/v2/`
  }),
}

export default api
