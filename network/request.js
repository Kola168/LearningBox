var app = getApp()
var Fly = require("../lib/net/wx.umd.min.js")
var request = new Fly()
// import api from './restful_request.js'
import refreshToken from './refresh_token.js'


request.interceptors.request.use((request) => {
	if (app.authToken) {
		request.headers = {
			"AUTHORIZATION": `Token token=${app.authToken}`
		}
	} else {
		try {
			var authToken = wx.getStorageSync('authToken')
			if (authToken) {
				request.headers = {
					"AUTHORIZATION": `Token token=${authToken}`
				}
			}
		} catch (e) {
			console.log(e)
		}
	}
	return request
})

request.interceptors.response.use(
	(response, promise) => {
		// console.log('restful请求全局捕获========',response.data)
		if(response.data.code === 40001 || response.data.code === 40004){ 
			refreshToken.dealRefreshToken(response.data.code)
		}else{
			return promise.resolve(response.data)
		}	
	},
	(error, promise) => {
		// return promise.reject()
		return promise.resolve(error)
	}
)


export default request