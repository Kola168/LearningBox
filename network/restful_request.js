var app = getApp()
import request from './request'
const api = {
  wechatDecryption: (params) => request.post(`users/wechat_decryption`, {
   params
  }, {
    baseURL: `${app.apiServer}/api/v1/`
  }),
   //资源分享签到
  shareResource: () => request.post(`users/share_resource`, {
  }, {
    baseURL: `${app.apiServer}/boxapi/v2/`
  }),

}

export default api