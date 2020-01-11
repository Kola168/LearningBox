// pages/error_book/camera.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import router from '../../../utils/nav'

import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

const chooseImage = util.promisify(wx.chooseImage)

Page({
    data: {
        showTipModal: true,
        // showCameraTip: true
    },

    onLoad: co.wrap(function* (options) {
        this.from = options.type
        // if (this.from == 'error_book') {
        //     let errorBook = wx.getStorageSync('errorBook')
        //     if (!errorBook || !errorBook.hideCameraTip) {
        //         this.setData({
        //             showTipModal: true
        //         })
        //     }
        // }

        logger.info('错题本', errorBook)

        this.longToast = new app.weToast()
        this.options = options
        // error_book:错题本首次上传图片
        // topic_details:错题详情页补充图片
        // photoAnswer:拍搜
        // before_add_error_book 错题保存前 直接用错题的图去搜索，不需要拍照
        //错题保存后拍搜 直接用错题的图去搜索，不需要拍照
    }),
    getAuth: co.wrap(function* () {
        try {
            let setting = yield getSetting()
            logger.info('是否授权', setting)
            let camera = setting.authSetting['scope.camera']
            if (camera === undefined) {
                this.allowCamera = 0
                // let auth = yield authorize({
                //     scope: 'scope.camera'
                // })
                // logger.info('进入页面就授权', auth)
            } else if (camera === false) {
                this.allowCamera = 1
                let oepnAuth = yield openSetting()
                logger.info('授权失败后再次授权', oepnAuth)
            } else {
                this.allowCamera = 2
            }
            this.setData({
                allowCamera: this.allowCamera
            })
            logger.info(' 0 未授权 1，授权失败， 2 已授权', this.allowCamera)
        } catch (e) {
            logger.info('获取授权/授权失败', e)
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
        logger.info('666')
        let CameraContext = wx.createCameraContext()
        let id = e.currentTarget.id
        let that = this
        try {
            if (id == 'camera') {
                CameraContext.takePhoto({
                    quality: 'high',
                    success: function (res) {
                        logger.info('相机', res)
                        router.redirectTo('pages/package_feature/error_book/edit_pic', {
                            url: res.tempImagePath,
                            type: that.from
                        })
                    }
                })
            } else if (id == 'album') {
                let res = yield chooseImage({
                    count: 1,
                    sizeType: ['compressed'],
                    sourceType: ['album']
                })
                logger.info('相册', res)
                router.redirectTo('pages/package_feature/error_book/edit_pic', {
                    url: res.tempFilePaths[0],
                    type: that.from
                })
            }
        } catch (e) {
            logger.info(e)
            util.showError({
                tite: '提示',
                mesage: '图片加载失败'

            })
        }

    }),
    onShareAppMessage: function () {
        return app.share
    },
    cancel: function () {
        router.navigateBack()
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
    //     logger.info('hhhhhh')
    //     this.setData({
    //         showCameraTip: false
    //     })
    // }
})