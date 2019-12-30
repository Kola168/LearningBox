/*
 * @Author: your name
 * @Date: 2019-12-26 11:44:22
 * @LastEditTime: 2019-12-27 14:41:37
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/pages/package_device/ble/common/no_wifi.js
 */
// pages/device/index.js

const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
const co = require('../../../../lib/co/co')
const util = require('../../../../utils/util')

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