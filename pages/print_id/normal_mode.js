"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')

import commonRequest from '../../utils/common_request'
import router from '../../utils/nav'

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
        hasAuthPhoneNum: false,
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
            console.log('证件照确认打印页参数', this.idPrint)
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
            console.log(e)
        }
    }),
    onShow: function () {
        let hasAuthPhoneNum = Boolean(wx.getStorageSync('hasAuthPhoneNum'))
        this.hasAuthPhoneNum = hasAuthPhoneNum
        this.setData({
            hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
        })
    },
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
    toConfirm: co.wrap(function* (e) {
        console.log('证件照打印时form发生了submit事件，携带数据为：', e.detail.formId, `print${this.data.mode}`)

        // if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
        //     return
        // }

        let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
        if (hideConfirmPrintBox) {
            this.print()
        } else {
            this.setData({
                ['confirmModal.isShow']: true
            })
        }
    }),

    getPhoneNumber: co.wrap(function* (e) {
        yield app.getPhoneNum(e)
        wx.setStorageSync("hasAuthPhoneNum", true)
        this.hasAuthPhoneNum = true
        this.setData({
            hasAuthPhoneNum: true
        })
        this.toConfirm(e)
    }),
    print: co.wrap(function* () {
        this.longToast.toast({
            type: "loading",
            duration: 0
        })
        // let images = [{
        //     url: this.data.imageURL,
        //     pre_convert_url: this.data.url,
        //     thumb_url: this.data.preview_url,
        //     number: this.data.num,
        //     rotate: false,
        //     media_type: this.data.mode,
        //     // height: data.height,
        //     // width: data.width
        // }]
        // console.log('证件照生成参数', images)
        // let params = {
        //     openid: app.openId,
        //     urls: images,
        //     media_type: this.data.mode
        // }
        // 提交制作信息
        try {
            var param = [{
                originalUrl: this.data.imageURL, //  用户上传的原文件
                printUrl: this.data.url, // 编辑后可打印的连接
                copies: this.data.num, // 打印份数
                grayscale: false, // 是否使用灰度打印
            }]
            const resp = commonRequest.createOrder('normal_id', param)
            console.log(resp)
            router.redirectTo('/pages/finish/index', {
              type: 'normal_id',
              media_type: 'invoice',
              state: resp.createOrder.state
            })
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
            return null
        }
    })
})