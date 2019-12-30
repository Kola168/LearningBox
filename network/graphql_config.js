var app = getApp()
var gqwxappGraphql = require('./wxgql')
var GraphQL = gqwxappGraphql.GraphQL
import storage from '../utils/storage.js'
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
    console.log('graphql全局错误拦截', res)
      //如果auth
    if (1) {

    }
  }
}, true);