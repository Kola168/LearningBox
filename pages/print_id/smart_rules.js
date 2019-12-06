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
        wx.setNavigationBarTitle({
            title: '示例'
        })
        console.log('page rules', this.data.spec)
        wx.setNavigationBarTitle({
            title: this.data.spec.name
        })
    },
    uploadImage: co.wrap(function* () {
        this.longToast.toast({
            type:'loading',
            duration: 0
        })
        try {
            this.imageURL = yield upload.uploadFile(this.path)
        } catch (e) {
            this.longToast.toast()
            console.error(e)
            const confirm = yield showModal({
                title: '上传失败',
                content: '请检查您的网络，请稍后重试',
                showCancel: false,
                confirmColor: '#FFE27A'
            })
        }
    }),



    confirm: co.wrap(function* () {
        let params = {
            is_async: true,
            url: this.imageURL,
            feature_key: "cert_id",
            spec_id: this.data.spec.spec_id
        }
        console.log('合成参数', params)
        try {
            const resp = yield api.convertId(params)
            if (resp.code != 0) {
                throw (resp.res)
            } else {
                console.log('证件照合成成功', resp.res)
                this.longToast.toast()
                let confirm = JSON.stringify(resp.res.sn)
                wx.redirectTo({
                    url: `smart_preview?confirm=${confirm}&info=${JSON.stringify(this.data.spec)}`
                })
            }
        } catch (e) {
            this.longToast.toast()
            console.log(e)
            util.showError(e)
            return
        }
    }),
    changeImage: co.wrap(function* () {
        this.selectComponent("#checkComponent").showPop()
    }),
    takePhoto: co.wrap(function* (e) {
        console.log(e)
        this.path = e.detail.tempFilePaths[0]
        try {
            yield this.uploadImage()
            yield this.confirm()
        } catch (err) {
            util.showError(e)
        }
    })
})