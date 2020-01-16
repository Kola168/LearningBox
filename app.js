"use strict"
let {
	weToast
} = require('lib/toast/wetoast.js')
import {
	regeneratorRuntime,
	co,
	util,
	_,
	storage,
	logger
} from './utils/common_import'
// import commonRequest from './utils/common_request.js'

const getSystemInfo = util.promisify(wx.getSystemInfo)
const login = util.promisify(wx.login)
const request = util.promisify(wx.request)
const checkSession = util.promisify(wx.checkSession)

App({
	weToast: weToast,
	version: '0.0.2',
	//线上地址
	// apiServer: 'https://api.xbxxhz.com',
	// apiWbviewServer: 'https://api.xbxxhz.com',

	//staging
	apiServer: 'https://lb-stg-1.gongfudou.com',
	apiWbviewServer: 'https://lb-stg-1.gongfudou.com',

	//王析理本地地址
	// apiServer: 'http://epbox.natapp1.cc',
	// apiWbviewServer: 'http://epbox.natapp1.cc',

	// 袁小飞接口
	// apiServer: 'http://schaffer.utools.club',

	//一个秃子的服务器地址
	// apiServer: 'http://jran.nat300.top',

	// 测试接口季慧新
	apiServer: 'http://jhx.nat300.top',

	// 测试接口张伟
	// apiServer: 'https://bboo.utools.club',

	// 许成本地服务
	// apiServer: 'http://xucheng.nat100.top',

	authAppKey: 'iMToH51lZ0VrhbkTxO4t5J5m6gCZQJ6c',
	openId: '',
	authToken: '',
	unionId: '',
	sysInfo: null,
	navBarInfo: null,
	rpxPixel: 0.5,
	deBug: false, //线上环境log调试
	refreshing: false,  //这个变量切勿占用，刷新token用
	userRequestFinish:false,//用户信息请求完毕

	onLaunch: co.wrap(function* () {
		yield this.getSystemInfo()
		this.navBarInfo = this.getNavBarInfo()
		yield this.getOpenId()
		yield this.checkVersion() //是否强制更新
	}),

	//检查新版本
	checkVersion: co.wrap(function* () {
		const updateManager = wx.getUpdateManager()
		updateManager.onCheckForUpdate(function (res) {
			console.log(res.hasUpdate)
		})
		updateManager.onUpdateReady(function () {
			wx.showModal({
				title: '更新提示',
				content: '新版本已经准备好，是否重启应用？',
				confirmColor: '#ffdc5e',
				showCancel: false,
				success: function (res) {
					if (res.confirm) {
						updateManager.applyUpdate()
					}
				}
			})
		})
		updateManager.onUpdateFailed(function () {
			wx.showModal({
				title: '更新提示',
				content: '新版本下载失败',
				confirmColor: '#ffdc5e',
				showCancel: false
			})
		})

	}),

	//获取系统信息
	getSystemInfo: co.wrap(function* () {
		let res = yield getSystemInfo()
		this.sysInfo = res
		this.handleDevice()
	}),

	// 是否为全面屏，rpxPixel
	handleDevice() {
		// 暂时的处理
		this.isFullScreen = this.sysInfo.screenHeight > 750 ? true : false
		this.rpxPixel = 750 / this.sysInfo.windowWidth
	},

	// 获取导航栏信息
	getNavBarInfo() {
		let sysInfo = this.sysInfo ? this.sysInfo : wx.getSystemInfoSync()
		let rect = null
		try {
			rect = wx.getMenuButtonBoundingClientRect()
		} catch (error) {
			rect = this.fixButtonBoundingClientRect()
		}
		let statusBarHeight = sysInfo.statusBarHeight,
			gap = rect.top - statusBarHeight,
			navBarHeight = 2 * gap + rect.height,
			navBarPadding = sysInfo.screenWidth - rect.right,
			topBarHeight = navBarHeight + statusBarHeight
		return {
			statusBarHeight,
			navBarHeight,
			topBarHeight,
			navBarPadding,
			titleWidth: sysInfo.screenWidth - navBarPadding * 2 - rect.width * 2,
			menuWidth: rect.width,
			menuHeight: rect.height
		}
	},

	// 修复wx.getMenuButtonBoundingClientRect接口报错，保证自定义导航栏不错位
	fixButtonBoundingClientRect() {
		let sysInfo = this.sysInfo,
			platform = sysInfo.platform.toLowerCase(),
			gap = '', //胶囊按钮上下间距 使导航内容居中
			width = 88 //胶囊的宽度，android大部分96，ios为88
		if (platform === 'android') {
			gap = 8
			width = 96
		} else if (platform === 'devtools') {
			let system = sysInfo.system.toLowerCase()
			if (system.indexOf('ios') > -1) {
				gap = 5.5 //开发工具中ios手机
			} else {
				gap = 7.5 //开发工具中android和其他手机
			}
		} else {
			gap = 4
			width = 88
		}
		return {
			bottom: sysInfo.statusBarHeight + gap + 32,
			height: 32,
			left: sysInfo.windowWidth - width - 10,
			right: sysInfo.windowWidth - 10,
			top: sysInfo.statusBarHeight + gap,
			width: width
		};
	},

	preventMoreTap: function (e) {
		if (_.isEmpty(e)) {
			return false
		}
		try {
			var globaTime = this.globalLastTapTime;
			var time = e.timeStamp;
			if (Math.abs(time - globaTime) < 500 && globaTime != 0) {
				this.globalLastTapTime = time;
				return true;
			} else {
				this.globalLastTapTime = time;
				return false;
			}
		} catch (e) {
			console.log(e)
		}
	},

	getOpenId: co.wrap(function* () {
		try {
			const sto = storage.get('openId')
			if (!sto) {
				this.login()
				return
			}
			this.openId = sto
		} catch (e) {
			this.login()
			console.log(e)
		}
	}),

	login: co.wrap(function* () {
		try {
			const loginCode = yield login()
			const loginInfo = yield request({
				url: this.apiServer + '/api/v1/users/sessions/wechat_jscode2session',
				method: 'POST',
				dataType: 'json',
				data: {
					'code': loginCode.code
				}
			})
			if (loginInfo.data.code !== 0) {
				throw (loginInfo.data)
			}
			storage.put('openId', loginInfo.data.res.openid)
			this.openId = loginInfo.data.res.openid
		} catch (e) {
			util.showError({
				title: '登录失败',
				content: e.error
			})
			return
		}
	}),

	//全局通判是否授权
	isScope:function(){
		const authToken = storage.get('authToken')
		return authToken ? true : false
	},

	//检测session是否过期
	checkSession: co.wrap(function*() {
    try {
      yield checkSession()
      return true
    } catch (e) {
      return false
    }
  })

})
