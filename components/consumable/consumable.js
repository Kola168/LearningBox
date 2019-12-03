const app = getApp()
// import commonRequest from '../../utils/common_request.js'


/**
 *  耗材弹窗组件
 */

Component({
  data: {
    appId: 'wxde848be28728999c',
    shopId: 24056376,
    openId: null,
    supply_types: []
  },
  attached() {
    let _this = this
    // _this.loopGetOpenId()
    // _this.getSupplyAfter() //获取耗材
  },
  methods: {
    loopGetOpenId: function () {
      let count = 100,
        _this = this;
      const loopEvent = function (count) {
        app.openId && _this.setData({
          openId: app.openId
        });
        (count > 0 && !app.openId) && setTimeout(loopEvent.bind(_this, --count), 2000)
      }
      return loopEvent(count)
    },
    getSupplyAfter: function () {
      let _this = this
      try {
        commonRequest.getSupplyAfter()
          .then((res) => {
            res.supply_types && _this.setData({
              supply_types: res.supply_types || []
            })
            _this.triggerEvent('event-success')
          })
      } catch (err) {
        _this.triggerEvent('event-error', err)
        console.log(err)
      }
    },
    order: function ({
      currentTarget: {
        id
      }
    }) {
      let {
        alias
      } = this.data.supply_types[id]
      let unionId = wx.getStorageSync('unionId')
      let url = unionId ?
        `/pages/cart/transit/transit?pageType=goodsDetail&goodsId=${alias}&openId=${this.data.openId}&shopId=${this.data.shopId}&appId=${this.data.appId}` :
        `/pages/authorize/index`;
      wx.navigateTo({
        url: url
      })
    }
  }
})