// pages/gallery/pages/document/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const showModal = util.promisify(wx.showModal)
const getSetting = util.promisify(wx.getSetting)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)
const downloadFile = util.promisify(wx.downloadFile)

import commonRequest from '../../../utils/common_request.js'
import router from '../../../utils/nav'
import featureGql from '../../../network/graphql/feature'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
Page({

    data: {
        share: app.galleryShare,
        documentPrintNum: 1,
        startPrintPage: 1,
        endPrintPage: 1,
        colorcheck: 'Color', //默认彩色
        endMaxPage: 1, //最大页数
        totalPage: 1,
        medium: 'a4',
        fileIndex: 0,
        isExcel: true,
        colorModes: 2,
        isColorPrinter: false,
        startPage: 1,
        endPage: 1,
        showConfirmModal: null,
        colorModes: [],
        isSetting: false,
        savable: true,
        urls: [],
        confirmModal: {
            isShow: false,
            title: '请正确放置A4打印纸',
            image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
        }
    },

    onLoad: co.wrap(function* (options) {
        this.longToast = new app.weToast()
        let urls = JSON.parse(options.urls)
        this.setData({
            urls: urls
        })
        this.getPrinterCapability()
        this.setData({
            startPrintPage: 1,
            endPrintPage: urls.length,
            startPage: 1,
            endPage: urls.length,
            endMaxPage: urls.length,
            totalPage: urls.length
        })

    }),
    onShow: function () {},
    getPrinterCapability: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            var resp = yield commonRequest.getPrinterCapacity('doc_a4')
            console.log(resp)
            this.longToast.hide()
            let isColorPrinter = false
            if (resp.color==true) {
                isColorPrinter = true
            }
            this.setData({
                isColorPrinter: isColorPrinter
            })
        } catch (error) {
            this.longToast.hide()
            console.log(error)
        }
    }),

    //减少份数
    cutPrintNum: function () {
        if (this.data.documentPrintNum <= 1) {
            return
        }
        this.data.documentPrintNum -= 1
        this.setData({
            documentPrintNum: this.data.documentPrintNum
        })
    },

    //增加份数
    addPrintNum: co.wrap(function* () {
        console.log(this.data.documentPrintNum)
        this.data.documentPrintNum += 1
        if (this.data.documentPrintNum <= 30) {
            this.setData({
                documentPrintNum: this.data.documentPrintNum
            })
        } else {
            this.setData({
                documentPrintNum: 30
            })
            yield showModal({
                content: '每次最多打印30份',
                confirmColor: '#2086ee',
                confirmText: "确认",
                showCancel: false
            })
            return
        }

    }),

    //输入打印起始页
    inputstartpage: function (e) {
        this.data.startPage = e.detail.value
    },

    startpagejudge: function (e) {
        if (parseInt(e.detail.value) > parseInt(this.data.endPrintPage) || parseInt(e.detail.value) <= 0) {
            this.setData({
                startPrintPage: 1,
                startPage: 1
            })
            wx.showModal({
                content: '请输入正确的起始页',
                confirmColor: '#2086ee',
                confirmText: "确认",
                showCancel: false
            })
            return
        } else {
            console.log('打印起始页===', e.detail.value)
            this.data.startPrintPage = e.detail.value
        }
    },
    //输入打印结束页
    inputendpage(e) {
        this.data.endPage = e.detail.value
    },
    endpagejudge(e) {
        let endMaxPage = this.data.endMaxPage,
            tempValue = parseInt(e.detail.value)
        if (tempValue < parseInt(this.data.startPrintPage) || tempValue > endMaxPage) {
            this.setData({
                endPrintPage: this.data.endMaxPage,
                endPage: this.data.endMaxPage
            })
            wx.showModal({
                content: '请输入正确的结束页',
                confirmColor: '#2086ee',
                confirmText: "确认",
                showCancel: false
            })
            return
        } else {
            this.data.endPrintPage = e.detail.value
        }
    },

    //选择颜色
    colorCheck(e) {
        this.setData({
            colorcheck: e.currentTarget.dataset.style
        })
    },

    allowSave: function (e) {
        if (!e.detail.authSetting['scope.writePhotosAlbum']) {
            return
        }
        this.setData({
            savable: true
        })
    },
    saveImg: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            let urls = this.data.urls
            for (let i = 0; i < urls.length; i++) {
                let data = yield downloadFile({
                    url: urls[i]
                })
                let tempPath = data.tempFilePath;
                yield saveImageToPhotosAlbum({
                    filePath: tempPath
                })
                if (i == (urls.length - 1)) {
                    this.longToast.hide()
                    wx.showToast({
                        title: '保存成功',
                        icon: 'none'
                    })
                }
            }
        } catch (e) {
            this.longToast.hide()
            let resp = yield getSetting()
            if (resp.authSetting['scope.writePhotosAlbum'] == false) {
                this.setData({
                    savable: false
                })
            }
            yield showModal({
                title: '保存失败',
                content: '请稍后重试',
                showCancel: false,
                confirmColor: '#fae100',
            })
        }
    }),
    cancelSetting() {
        this.setData({
            isSetting: false
        })
    },
    showSetting() {
        this.setData({
            isSetting: true
        })
    },

    //确认按钮提交
    confcheck() {
        console.log('34567890-')
        if (parseInt(this.data.startPage) > parseInt(this.data.endPage) || parseInt(this.data.startPage) <= 0) {
            this.setData({
                startPrintPage: 1,
                startPage: 1
            })
            wx.showModal({
                content: '请输入正确的起始页',
                confirmColor: '#2086ee',
                confirmText: "确认",
                showCancel: false
            })
            return
        }

        if (parseInt(this.data.endPage) < parseInt(this.data.startPage) || parseInt(this.data.endPage) > parseInt(this.data.totalPage)) {
            this.setData({
                endPrintPage: this.data.endMaxPage,
                endPage: this.data.endMaxPage
            })
            wx.showModal({
                content: '请输入正确的结束页',
                confirmColor: '#2086ee',
                confirmText: "确认",
                showCancel: false
            })
            return
        }
        let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
        if (hideConfirmPrintBox) {
            this.print()
        } else {
            this.setData({
                ['confirmModal.isShow']: true
            })
        }
    },
    // 打印
    print: co.wrap(function* () {
        let images = [],
            startPage = Number(this.data.startPage) - 1,
            endPage = Number(this.data.endPage)
        let urls = this.data.urls.slice(startPage, endPage)
        for (let i = 0; i < urls.length; i++) {
            let tempObj = {}
            tempObj.originalUrl = urls[i]
            tempObj.printUrl = urls[i]
            tempObj.color = this.data.colorcheck == "Color" ? true : false,
                tempObj.duplex = false
            tempObj.copies = this.data.documentPrintNum
            tempObj.grayscale = false
            tempObj.startPage = startPage
            tempObj.endPage = endPage
            images.push(tempObj)
        }
        this.longToast.toast({
            type: 'loading'
        })
        try {
            // 拍搜打印
            const resp = yield commonRequest.createOrder('photo_answer', images)
            console.log(resp)
            router.redirectTo('/pages/finish/index', {
                type: 'photo_answer',
                media_type: 'photo_answer',
                state: resp.createOrder.state
            })
            this.longToast.hide()
        } catch (e) {
            this.longToast.hide()
            util.showErr(e)
        }
    }),
})