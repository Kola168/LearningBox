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
   * 组件的方法列表
   */
	methods: {
		hideModal: function (e) {
			this.triggerEvent('close')
		},

		order: function (e) {
			let id = e.currentTarget.id
			let supplies = this.data.supply_types,
					appId = supplies[id].appId,
					path = supplies[id].url;
			wx.navigateToMiniProgram({
				appId: appId,
				path: path,
				success: (res)=>{
				}
			})
		}

	}
})