
var app = getApp()
import api from './restful_request.js'
import { regeneratorRuntime, co } from '../utils/common_import'
import storage from '../utils/storage.js'

function dealRefreshToken(code) {
	if (code == 40001) {
		if(!app.refreshing){
			app.refreshing = true
			var refreshToken = storage.get('refreshToken')	
			console.log('refreshToken=======',refreshToken)
			api.refreshAuthToken(refreshToken).then(function (resp) {
				console.log('返回的resp======', resp)
				if (resp.code == 0) {
					app.refreshing = false
					storage.put('authToken', resp.res.auth_token)
					storage.put('refreshToken', resp.res.refresh_token)
				}
			}).catch(function (e) {
				console.log(e)
			})
		}	
	} else if (code == 40004) {
		wx.reLaunch({
			url: '/pages/test/index'
		})
	}
}

module.exports = {
	dealRefreshToken: dealRefreshToken
}