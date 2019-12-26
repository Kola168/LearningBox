// pages/error_book/camera.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import router from '../../../utils/nav'

const chooseImage = util.promisify(wx.chooseImage)

Page({
    data: {
        showTipModal: false,
        // showCameraTip: true
    },
    onLoad: co.wrap(function* (options) {
        let errorBook = wx.getStorageSync('errorBook')
        console.log('错题本', errorBook)
        if (!errorBook || !errorBook.hideCameraTip) {
            this.setData({
                showTipModal: true
            })
        }
        this.longToast = new app.weToast()
        this.options = options
        this.from = options.from
    }),
    getAuth: co.wrap(function* () {
        try {
            let setting = yield getSetting()
            console.log('是否授权', setting)
            let camera = setting.authSetting['scope.camera']
            if (camera === undefined) {
                this.allowCamera = 0
                // let auth = yield authorize({
                //     scope: 'scope.camera'
                // })
                // console.log('进入页面就授权', auth)
            } else if (camera === false) {
                this.allowCamera = 1
                let oepnAuth = yield openSetting()
                console.log('授权失败后再次授权', oepnAuth)
            } else {
                this.allowCamera = 2
            }
            this.setData({
                allowCamera: this.allowCamera
            })
            console.log(' 0 未授权 1，授权失败， 2 已授权', this.allowCamera)
        } catch (e) {
            console.log('获取授权/授权失败', e)
            switch (this.allowCamera) {
                case 0:
                    wx.navigateBack()
                    break
                case 1:
                    break
                case 2:
                    break
            }

        }
    }),
    takePhoto: co.wrap(function* (e) {
        console.log('666')
        let CameraContext = wx.createCameraContext()
        let id = e.currentTarget.id
        let that = this
        try {
            if (id == 'camera') {
                CameraContext.takePhoto({
                    quality: 'high',
                    success: function (res) {
                        router.redirectTo('pages/package_feature/error_book/edit_pic', {
                            url: res.tempImagePath
                        })
                    }
                })
            } else if (id == 'album') {
                let res = yield chooseImage({
                    count: 1,
                    sizeType: ['compressed'],
                    sourceType: ['album']
                })
                console.log('相册', res)
                router.redirectTo('pages/package_feature/error_book/edit_pic', {
                    url: res.tempImagePath
                })
            }
        } catch (e) {
            console.log(e)
        }

    }),
    onShareAppMessage: function () {
        return app.share
    },
    cancel: function () {
        wx.navigateBack()
    },
    hideTipModal: function () {
        // let errorBook = wx.getStorageSync('errorBook')
        // errorBook.hideCameraTip = true
        // wx.setStorageSync('errorBook', errorBook)
        this.setData({
            showTipModal: false
        })
    },
    // closeCameraTip: function() {
    //     console.log('hhhhhh')
    //     this.setData({
    //         showCameraTip: false
    //     })
    // }
})