// pages/device/index.js

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)


Page({
    data: {
        source: '',
        isIphone: false
    },

    onLoad: co.wrap(function*(options) {
        console.log(app.sysInfo)
        let system = app.sysInfo.system.toLowerCase(),
        isIphone = system.includes('ios')

        this.setData({
            source: options.source === 'box' ? 'box' : 'printer',
            isIphone
        })
    }),
    onShow: co.wrap(function*() {

    }),

    retry: co.wrap(function*() {
        wx.navigateBack()
    }),

    toBluetoothIntro(){
        wx.navigateTo({
            url: './bluetooth_intro'
        })
    }
})