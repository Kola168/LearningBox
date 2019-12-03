var app = getApp()
import request from './request'

const api = {
	
  covertInvoiceToPdf: (openId, convertUrls) => request.post(`orders/invoice_url_convert`, {
    openid: openId,
    pdf_urls: convertUrls
  }, {
    baseURL: `${app.apiServer}/ec/v2/`
  }),
   //invoice print interface
   printInvoice: (mediaType, invoiceUrls) => request.post(`orders`, {
    media_type: mediaType,
    urls: invoiceUrls
  }, {
    baseURL: `${app.apiServer}/ec/v2/`
  }),
}

export default api
