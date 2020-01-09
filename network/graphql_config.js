var app = getApp()
var gqwxappGraphql = require('./wxgql')
var GraphQL = gqwxappGraphql.GraphQL
import storage from '../utils/storage.js'
import api from './restful_request.js'


// 初始化对象
export default GraphQL({
  url: `${app.apiServer}/graphql`,
  header: function() {
    if (app.authToken) {
      return {
        "AUTHORIZATION": `Token token=${app.authToken}`
      }
    } else {
      try {
        var authToken = storage.get('authToken')
        if (authToken) {
          return {
            "AUTHORIZATION": `Token token=${authToken}`
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
  },

  //全局错误拦截
  errorHandler: function(res) {
		console.log('graphql全局错误拦截',res)
		console.log('错误码=======',res.errors[0].extensions.code)
			//如果auth
    if (res.errors[0].extensions.code === 40001) {
			var refreshToken = storage.get('refreshToken')	
			console.log('refreshToken=======',refreshToken)
      api.refreshAuthToken(refreshToken).then(function(resp){
				console.log('返回的resp======',resp)
        if(resp.code == 0){
					storage.put('authToken', resp.res.auth_token)
					storage.put('refreshToken', resp.res.refresh_token)
				}
			}).catch(function(e){
				console.log(e)
			})

		}
		



  }
}, true);