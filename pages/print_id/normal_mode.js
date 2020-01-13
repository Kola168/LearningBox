"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')

import commonRequest from '../../utils/common_request'
import router from '../../utils/nav'
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

Page({
    data: {
        share: app.share,
        mode: '',
        num: 1,
        designID: '',
        imageURL: '', //原图,未编辑
        url: '', //合成后原图
        preview_url: '', //合成后预览图
        price: 0,
        price_count: 0,
        showConfirmModal: null,
        confirmModal: {
            isShow: false,
            title: '请确认6寸照片纸放置正确',
            image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print.png'
        }
    },
    // 分享事件
    onShareAppMessage: function () {
        return app.share
    },
    onLoad: co.wrap(function* (query) {
        try {
            this.idPrint = JSON.parse(query.idPrint)
            logger.info('证件照确认打印页参数', this.idPrint)
            this.longToast = new app.weToast()
            // 本地照片
            this.setData({
                url: this.idPrint.url.replace('http://', 'https://'),
                preview_url: decodeURIComponent(this.idPrint.preview_url).replace('http://', 'https://'),
                imageURL: this.idPrint.imageURL,
                mode: this.idPrint.mode,
                name: this.idPrint.name
            })
            if (this.idPrint.price) {
                this.setData({
                    price: this.idPrint.price,
                    price_count: this.idPrint.price
                })
            }
        } catch (e) {
            logger.info(e)
        }
    }),

    tapMin: co.wrap(function* () {
        if (this.data.num > 1) {
            this.setData({
                num: this.data.num - 1,
                price_count: ((this.data.num - 1) * this.data.price).toFixed(2)
            })
        }
    }),
    tapPlus: co.wrap(function* () {
        if (this.data.num < 9) {
            this.setData({
                num: this.data.num + 1,
                price_count: ((this.data.num + 1) * this.data.price).toFixed(2)
            })
        }
    }),
    toConfirm: co.wrap(function* () {
        let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
        if (hideConfirmPrintBox) {
            this.print()
        } else {
            this.setData({
                ['confirmModal.isShow']: true
            })
        }
    }),

    print: co.wrap(function* () {
        this.longToast.toast({
            type: "loading",
            duration: 0
        })
        // 提交制作信息
        try {
            var param = [{
                originalUrl: this.data.imageURL, //  用户上传的原文件
                printUrl: this.data.url, // 编辑后可打印的连接
                copies: this.data.num, // 打印份数
                grayscale: false, // 是否使用灰度打印
            }]
            const resp = yield commonRequest.createOrder('normal_id', param)
            router.redirectTo('/pages/finish/index', {
              type: 'normal_id',
              media_type: 'normal_id',
              state: resp.createOrder.state
            })
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
            return null
        }
    })
})
