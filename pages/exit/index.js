Page({
	onLoad:function(){
	  try {
			wx.clearStorageSync()
		} catch(e) {
			// Do something when catch error
		}
	}
})