const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)


Page({
    data: {
        deviceImage: '',
        showBindButton: true,
        state: '',
        deviceName: '',
        deviceId: ''
    },

    onLoad: co.wrap(function*(query) {
        this.deviceInfo = query.deviceInfo
        let deviceInfoDetail = JSON.parse(decodeURIComponent(query.deviceInfo))

        console.log('deviceInfoDetail===========', deviceInfoDetail, query.state)
        this.setData({
            showBindButton: query.state == 'online' ? true : false,
            deviceName: deviceInfoDetail.device.localName,
            deviceImage: deviceInfoDetail.device.localName.split('-')[0] == 'EP200' ? 'https://cdn.gongfudou.com/miniapp/ec/ble/ble_box_light_red.png' : 'https://cdn.gongfudou.com/miniapp/ec/ble/l3115_new_red.png',
            deviceId: deviceInfoDetail.device.deviceId
        })

        console.log('this.data.deviceId', this.data.deviceId)
        console.log('this.data.deviceName', this.data.deviceName)

    }),
    onShow: co.wrap(function*() {

    }),
    startWifi: co.wrap(function*() {
        wx.navigateTo({
            url: `/pages/ble/network/wifi_list?deviceInfo=${this.deviceInfo}`
        })
    }),

    finish: co.wrap(function*() {
        wx.navigateTo({
            url: `/pages/ble/common/connect_success?deviceId=${this.data.deviceId}&deviceName=${this.data.deviceName}`
        })
    }),
})