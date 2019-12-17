const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
	properties: {
		modal: {
			type: Object,
			value: null
		},
		supply_types: Array,
	},

	externalClasses: ['consumables-icon'],

  /**
   * 组件的初始数据
   */
	data: {
		showGetModal: false,
	},

  /**
   * 组件的方法列表
   */
	methods: {
		hideModal: function (e) {
			this.setData({
				showGetModal: false
			})
		},

		order: function (e) {
			let id = e.currentTarget.id
			let alias = this.properties.supply_types[id].alias
			console.log(alias, this.data.shopId, this.data.appId, this.data.openId)
			let unionId = wx.getStorageSync('unionId')
			console.log('商城授权')
			if (!unionId) {
				let url = `/pages/authorize/index`
				wx.navigateTo({
					url: url,
				})
			} else {
				wx.navigateTo({
					url: `/pages/cart/transit/transit?pageType=goodsDetail&goodsId=${alias}&openId=${this.data.openId}&shopId=${this.data.shopId}&appId=${this.data.appId}`
				})
			}
		}

	}
})