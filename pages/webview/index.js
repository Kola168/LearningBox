Page({
	onLoad:function(options){
		console.log(decodeURIComponent(options.url))
		let url = decodeURIComponent(options.url)
    this.setData({
		url:url
		})
	}
})