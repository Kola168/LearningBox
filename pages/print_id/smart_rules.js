// pages/idprint/rules.js
"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const chooseImage = util.promisify(wx.chooseImage)
const showModal = util.promisify(wx.showModal)
const chooseMessageFile = util.promisify(wx.chooseMessageFile)
import upload from '../../utils/upload'
import api from '../../network/restful_request.js'
import getLoopsEvent from '../../utils/worker'
import router from '../../utils/nav'

Page({
    data: {
        rule: {
            format: 'JPEG',
        },
        popWindow: false
    },
    onShareAppMessage: function () {
        return app.share
    },
    onLoad: function (options) {
        this.longToast = new app.weToast()
        this.setData({
            spec: JSON.parse(options.item)
        })
    },
    uploadImage: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading',
            duration: 0
        })
        try {
            this.imageURL = yield upload.uploadFile(this.path)
        } catch (e) {
            this.longToast.hide()
            util.showError({
                title: '上传失败',
                message: '请检查您的网络，请稍后重试'
            })
        }
    }),

    confirm: co.wrap(function* () {
        let params = {
            is_async: true,
            url: this.imageURL,
            spec_id: this.data.spec.spec_id
        }
        console.log('合成参数', params)
        try {
            getLoopsEvent({
                feature_key: 'cert_id',
                worker_data: params
            }, (resp) => {
                if (resp.status == 'finished') {
                    this.longToast.hide()
                    let confirm = JSON.stringify(resp.data)
                    router.redirectTo('/pages/print_id/smart_preview', {
                        confirm: confirm,
                        info: JSON.stringify(this.data.spec)
                    })
                }
            }, () => {
                this.longToast.hide()
            })
        } catch (err) {
            logger.info(err)
            this.longToast.hide()
            util.showError(err)
        }

    }),
    changeImage: co.wrap(function* () {
        this.selectComponent("#checkComponent").showPop()
    }),
    takePhoto: co.wrap(function* (e) {
        this.path = e.detail.tempFilePaths[0]
        try {
            yield this.uploadImage()
            yield this.confirm()
        } catch (err) {
            util.showError(err)
        }
    }),
    baiduprint: co.wrap(function* (e) {
        this.path = e.detail[0].url
        try {
            yield this.uploadImage()
            yield this.confirm()
        } catch (err) {
            util.showError({
                title: '照片加载失败',
                content: '请重新选择重试'
            })
        }
    }),
})