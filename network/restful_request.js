var app = getApp()
import request from './request'
const api = {
  wechatDecryption: (params) => request.post(`users/wechat_decryption`, {
   params
  }, {
    baseURL: `${app.apiServer}/api/v1/`
  }),

  processes:(params)=>request.post(`processes`, {
   params
  }, {
    baseURL: `${app.apiServer}/api/v1/`
  })
}

export default api
