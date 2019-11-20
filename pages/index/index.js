const app = getApp()
import wxNav from '../../utils/nav.js'
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

import storage from '../../utils/storage.js'


Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
 
	//事件处理函数
  bindViewTap: function() {
    wxNav.navigateTo( '/pages/logs/logs')
  },
	
	onLoad: function () {
		logger.error('123456789')
		logger.warn('123456789')
		logger.info('1234567890000','6789')
		logger.debug('123456789')
		storage.put('hello','123')
	 
		this.longToast = new app.weToast()
    this.longToast.toast({
      type:"loading",
      duration:3000
    })
	}
})
