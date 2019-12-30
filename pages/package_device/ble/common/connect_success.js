// pages/device/index.js

const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
const co = require('../../../../lib/co/co')
const util = require('../../../../utils/util')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const closeBLEConnection = util.promisify(wx.closeBLEConnection)
const closeBluetoothAdapter = util.promisify(wx.closeBluetoothAdapter)


Page({
    data: {
        deviceImage: '',
        printer_type: 'EpDevice',
        deviceName: ''
    },

    onLoad: co.wrap(function*(query) {
        this.longToast = new app.WeToast()
        this.user_id = wx.getStorageSync('user_id')
        this.box_id = wx.getStorageSync('box_id')

        console.log('1111111111111', query)
        if (query.deviceInfo) {
            let deviceInfo = JSON.parse(decodeURIComponent(query.deviceInfo))
            this.deviceId = deviceInfo.device.deviceId
            console.log('配置页面接收到的特征值消息=====', deviceInfo)
            yield this.initUI(deviceInfo)
        } else if (query.deviceId) {
            this.deviceId = query.deviceId
            this.name = query.deviceName
            yield this.initOriginalUI(this.name)
        }

        console.log('要分享的参数userId,deviceId', this.user_id, this.box_id)

    }),
    onShow: co.wrap(function*() {

    }),

    initUI: co.wrap(function*(deviceInfo) {
        let deviceName = deviceInfo.device.localName.split('-')[0]
        this.setData({
            deviceName: deviceName,
            deviceImage: deviceName == 'EP200' ? 'https://cdn.gongfudou.com/miniapp/ec/ble/ble_box_light_green.png' : 'https://cdn.gongfudou.com/miniapp/ec/ble/l3115_new_red.png',
        })
    }),

    initOriginalUI: co.wrap(function*(name) {

        let deviceName = name.split('-')[0]
        this.setData({
            deviceImage: deviceName == 'EP200' ? 'https://cdn.gongfudou.com/miniapp/ec/ble/ble_box_light_green.png' : 'https://cdn.gongfudou.com/miniapp/ec/ble/l3115_new_red.png',
        })
    }),

    start: co.wrap(function*() {
        console.log('zhixing====')
        app.bindNew = 'bindNewDevice'
        wx.switchTab({
            url: '/pages/index/index',
            success: function(res) {},
        })
    }),

    onShareAppMessage: function(res) {
        if (res.from === 'button' || res[0].from === 'button') {
            console.log(res.target)
        }
        // return {
        //     title: '好友分享给您一台打印设备，快快点击绑定吧',
        //     path: `/pages/index/index?deviceId=${this.box_id}&printer_type=${this.data.printer_type}&user_id=${this.user_id}`,
        //     imageUrl: '/images/share_image.jpg'
				// }
				 return {
            title: '好友分享给您一台打印设备，快快点击绑定吧',
						path: `/pages/index/index?deviceSn=${this.box_id}`,
            imageUrl: '/images/share_image.jpg'
				}
			
    },


    experiencePhoto: function() {
        wx.switchTab({
            url: '/pages/index/index',
            success: function(res) {},
        })
    },

    experienceFile: function() {
        wx.switchTab({
            url: '/pages/index/index',
            success: function(res) {},
        })
    },

    experienceArticle: function() {
        wx.switchTab({
            url: '/pages/index/index',
            success: function(res) {},
        })
    },

    onUnload: co.wrap(function*() {
        console.log('111111111111112', this.deviceId)
        console.error('执行到onDestroy========!')
        try {
            yield closeBLEConnection({
                deviceId: this.deviceId
            })
        } catch (e) {
            console.log('closeBLEConnection异常', e)
        }
        try {
            yield closeBluetoothAdapter()
        } catch (e) {
            console.log('closeBluetoothAdapter异常', e)
        }
    })
})