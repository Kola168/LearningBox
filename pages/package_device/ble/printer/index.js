const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const CryptoJS = require("../../../lib/crypto-js/crypto-js")
const event = require('../../../lib/event/event')
const closeBLEConnection = util.promisify(wx.closeBLEConnection)


const getSystemInfo = util.promisify(wx.getSystemInfo)
const showModal = util.promisify(wx.showModal)

const openBluetoothAdapter = util.promisify(wx.openBluetoothAdapter)
const closeBluetoothAdapter = util.promisify(wx.closeBluetoothAdapter)
const startBluetoothDevicesDiscovery = util.promisify(wx.startBluetoothDevicesDiscovery)
const stopBluetoothDevicesDiscovery = util.promisify(wx.stopBluetoothDevicesDiscovery)
const getBluetoothDevices = util.promisify(wx.getBluetoothDevices)

const scanWifiServiceUUID = '09FC95C0-C111-11E3-9904-0002A5D5C51B'
const setNetworkServiceUUID = '09FC95C0-C178-11E3-9904-0002A5D5C51B'
const debugServiceUUID = '89FC95C8-C178-11E3-9904-0002A5D5C51A'


Page({
    data: {
        source: 'printer'
    },

    onLoad: co.wrap(function*(query) {
        this.longToast = new app.WeToast()
        let _this = this

        event.on('Authorize', this, function(data) {

        })
        event.on('Ble', this, function(deviceId) {
            this.deviceId = deviceId
        })
    }),
	 
		onShow: co.wrap(function*() {
        if (this.deviceId != '' && this.deviceId != null && this.deviceId != undefined) {
            try {
                yield closeBLEConnection({
                    deviceId: this.deviceId
                })
            } catch (e) {
                console.log('closeBLEConnection异常', e)
            }
        }
        let unionId = wx.getStorageSync('unionId')
        if (!unionId) {
            let url = `/pages/authorize/index`
            wx.navigateTo({
                url: url,
            })
        }
    }),

    //清洗数据
    clearDevices: function(devices) {
        let clearDevices = []
        devices.forEach(item => {
            if (item.localName.split('-')[0] == 'EP320') {
                clearDevices.push(item)
            }
        })
        return clearDevices
    },

    startSerch: co.wrap(function*() {
        let devices = yield this.searchDevice()
        console.log('蓝牙搜索EP320返回的设备列表=======', devices)

        let clearDevices = []
        if (devices.length > 0) {
            clearDevices = this.clearDevices(devices)
        }

        console.log('要传递的EP320设备列表=========', clearDevices)
        if (devices != undefined && clearDevices.length == 0) {
            wx.navigateTo({
                url: `/pages/ble/common/no_device?source=${this.data.source}`,
            })
        } else if (devices != undefined && clearDevices.length > 0) {
            wx.navigateTo({
                url: `/pages/ble/device/device?devices=${encodeURIComponent(JSON.stringify(clearDevices))}&source=${this.data.source}`,
            })
        }
    }),

    searchDevice: co.wrap(function*() {
        this.longToast.toast({
            img: '/images/loading.gif',
            title: '搜索中',
            duration: 0
        })

        try {
            // 先尝试关闭适配器
            yield closeBluetoothAdapter()
        } catch (e) {
            this.longToast.toast()
            console.log('关闭蓝牙适配器异常', e)
        }
        // 开启适配器
        try {
            yield openBluetoothAdapter()
        } catch (e) {
            this.longToast.toast()
            console.log('开启蓝牙适配器异常', e)
            wx.navigateTo({
                url: '/pages/ble/common/no_bluetooth?source=${this.data.source}'
            })
            return
        }
        // 启动蓝牙发现
        yield startBluetoothDevicesDiscovery({
            services: [scanWifiServiceUUID, setNetworkServiceUUID, debugServiceUUID],
            allowDuplicatesKey: false
        })
        yield util.sleep(3000)

        const devices = yield getBluetoothDevices()
        yield stopBluetoothDevicesDiscovery()
        this.longToast.toast()
        return devices.devices
    }),
    onUnload: function() {
        event.remove('Authorize', this)
        event.remove('Ble', this)
        this.deviceId = ''
    },
    connectPower: function() {
        wx.navigateTo({
            url: `/pages/video/index`
        })
    }
})