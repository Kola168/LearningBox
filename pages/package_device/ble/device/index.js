/*
 * @Author: your name
 * @Date: 2019-12-26 11:44:22
 * @LastEditTime: 2019-12-28 09:46:59
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/pages/package_device/ble/device/index.js
 */
// pages/device/index.js
const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
const co = require('../../../../lib/co/co')
const util = require('../../../../utils/util')
const CryptoJS = require("../../../../lib/crypto-js/crypto-js")
const event = require('../../../../lib/event/event')


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

    },
})