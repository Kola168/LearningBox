var app = getApp()
var Fly = require("../lib/net/wx.umd.min.js")
var request = new Fly()

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
		return promise.resolve(response.data)
	},
	(error, promise) => {
		// return promise.reject()
		return promise.resolve(error)
	}
)

export default request