var app = getApp()
var gqwxappGraphql = require('./wxgql')
var GraphQL = gqwxappGraphql.GraphQL
import storage from '../utils/storage.js'
import { regeneratorRuntime, co } from '../utils/common_import'
import refreshToken from './refresh_token.js'

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
  errorHandler:  co.wrap(function*(res) { 
		console.log('graphql全局错误拦截',res)
		try {
			if(res.errors[0].extensions && res.errors[0].extensions.code){
				refreshToken.dealRefreshToken(res.errors[0].extensions.code)
			}
		} catch (error) {			
		}
  })
}, true);