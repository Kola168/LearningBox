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
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

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
    uploadImage: co.wrap(function* (e) {
        this.longToast.toast({
            type: 'loading',
            duration: 0
        })
        this.path = e.detail.tempFiles[0].path
        try {
            this.imageURL = yield upload.uploadFile(this.path)
            yield this.confirm()
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
        logger.info('合成参数', params)
        try {
            getLoopsEvent({
                feature_key: 'cert_id',
                worker_data: params
            }, (resp) => {
                console.log('34567******890', resp)
                if (resp.status == 'finished') {
                    this.longToast.hide()
                    let params = {
                        // is_print:resp.data.is_print,
                        print_wm_url: resp.data.print_wm_url,//合成的打印图，没有传’‘
                        wm_url: resp.data.wm_url,//合成的单张图
                        sn: resp.data.sn, //worker sn
                        name: this.data.spec.name,  
                        size: this.data.spec.size
                    }
                    router.redirectTo('/pages/print_id/smart_preview', {
                        params:JSON.stringify(params)
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
    baiduprint: co.wrap(function* (e) {
        this.imageURL = e.detail[0].url
        yield this.confirm()
    }),
})