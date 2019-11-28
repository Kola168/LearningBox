"use strict"
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const setClipboardData = util.promisify(wx.setClipboardData)

Page({
    onLoad: function(options) {
        var res = wx.getSystemInfoSync()
        this.url = 'https://zcybtest.oss-cn-hangzhou.aliyuncs.com/app-release.apk'
        if (res.system.indexOf('iOS') > -1) {
            this.url = 'https://itunes.apple.com/us/app/小白智慧打印/id1436569772?l=zh&ls=1&mt=8'
        }
    },

    copy: co.wrap(function*() {
        try {
            setClipboardData({
                data: this.url
            })
        } catch (e) {
            util.showErr({ message: '复制失败，请重新尝试' })
        }
    })
})