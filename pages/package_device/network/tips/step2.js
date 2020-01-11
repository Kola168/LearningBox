// pages/network/tips/step2.js
import wxNav from '../../../../utils/nav.js'

Page({

	data: {
		checked: false
	},

	onLoad: function (options) {
		console.log(options)
	},

	confirmLight: function () {
		this.setData({
			checked: !this.data.checked
		})
	},

	nextStep: function () {
		if (this.data.checked) {
			wxNav.navigateTo('/pages/package_device/network/tips/step3')
		} else {
			wx.showToast({
				title: '请确认此时黄灯闪烁',
				icon: 'none',
				duration: 2000
			})
		}
	}
})
