"use strict"

const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const request = util.promisify(wx.request)

const event = require('../../lib/event/event')

Page({
  data: {
  },

  onLoad: co.wrap(function*(options) {
    this.longToast = new app.WeToast()	
  }),

  onShow() {
   
  },

  onUnload: function() {
    event.remove('Authorize', this)
  },

	
	toPrinter:function(){
		wx.navigateToMiniProgram({
			appId: 'wxfb4fb840f87fef41',
			path: 'packages/goods/detail/index?alias=2onwbc6848jyw&dc_ps=2399891955761809408.200001',
			envVersion: 'release',
			success(res) {}
		})
	},

	toBox:function(){
		wx.navigateToMiniProgram({
			appId: 'wxfb4fb840f87fef41',
			path: 'packages/goods/detail/index?alias=2flinflzslpbc&dc_ps=2412769315410466823.200001',
			envVersion: 'release',
			success(res) {}
		})
	},

	toPromotion:function(){
		wx.navigateToMiniProgram({
			appId: 'wxfb4fb840f87fef41',
			path: 'pages/home/feature/index?alias=3qb1ot2FNy&dc_ps=2399892587717714951.200001',
			envVersion: 'release',
			success(res) {}
		})
	},

	toPaper:function(){
		wx.navigateToMiniProgram({
			appId: 'wxfb4fb840f87fef41',
			path: 'pages/home/feature/index?alias=Qc53kJfjJc&dc_ps=2399893382462900233.200001',
			envVersion: 'release',
			success(res) {}
		})
	},

  toOrder:function(){
		wx.navigateToMiniProgram({
			appId: 'wxfb4fb840f87fef41',
			path: 'pages/usercenter/dashboard/index',
			envVersion: 'release',
			success(res) {}
		})
	}

})