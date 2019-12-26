// pages/device/index.js

// pages/device/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const CryptoJS = require("../../../lib/crypto-js/crypto-js")

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
        source: ''
    },

    onLoad: co.wrap(function*(query) {
        this.longToast = new app.WeToast()
        let _this = this

        // this.setData({
        //         source: options.source === 'box' ? 'box' : 'printer'
        //     })
    }),
    onShow: co.wrap(function*() {

    }),

    startSerch: co.wrap(function*() {
        wx.navigateBack()
    })
})