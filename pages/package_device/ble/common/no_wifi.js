// pages/device/index.js

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)


Page({
    data: {},

    onLoad: co.wrap(function*(query) {
        this.deviceInfo = query.deviceInfo
    }),
    onShow: co.wrap(function*() {

    }),

    retry: co.wrap(function*() {
        wx.redirectTo({
            url: `/pages/ble/network/wifi_list?deviceInfo=${this.deviceInfo}`
        })
    }),
})