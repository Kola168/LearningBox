const app = getApp()
import {
	storage
} from '../../utils/common_import'
Page({
	data: {
		url: ''
	},
	onLoad() {
		let userSn = storage.get('userSn'),
			system = app.sysInfo.system.toLocaleLowerCase(),
			isIos = system.indexOf('ios') > -1 ? '&ios=1' : ''
			 console.log(`${app.apiServer}/customer/members?user_sn=${userSn}${isIos}`)
			this.setData({
			url: `${app.apiServer}/customer/members?user_sn=${userSn}${isIos}`
		})
	}
})