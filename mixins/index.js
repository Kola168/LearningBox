function request() {
  wx.request({
    url: 'https://epbox.gongfudou.com/boxapi/v2/compositions/styles',
    method: "get",
    success: (res) => {
      console.log(res)
    }
  })
}

module.exports = {
  onLoad(options) {
    request()
    console.log('========onLoadMixin========')
  },
  onShow() {
    console.log('========onShowMixin========')
  },
  otherMethods() {
    console.log('========otherMethods=======')
  }
}