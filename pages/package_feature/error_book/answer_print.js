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
import gql from '../../../network/graphql_request.js'
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
        hasAuthPhoneNum:false,
        confirmModal: {
            isShow: false,
            title: '请正确放置A4打印纸',
            image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
        }
    },

    onLoad: co.wrap(function*(options) {
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
    onShow:function(){
        let hasAuthPhoneNum = Boolean(wx.getStorageSync('hasAuthPhoneNum'))
        this.hasAuthPhoneNum = hasAuthPhoneNum
        this.setData({
            hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
        })
    },
    getPrinterCapability: co.wrap(function*() {
        wx.showLoading({
            title: '请稍等'
        })
        try {
            let resp = yield commonRequest.getPrinterCapability()
            wx.hideLoading()
            let isColorPrinter = false
            if (resp.color_modes.length > 1) {
                isColorPrinter = true
            }
            this.setData({
                isColorPrinter: isColorPrinter
            })
        } catch (error) {
            wx.hideLoading()
            console.log(error)
        }
    }),

    //减少份数
    cutPrintNum: function() {
        if (this.data.documentPrintNum <= 1) {
            return
        }
        this.data.documentPrintNum -= 1
        this.setData({
            documentPrintNum: this.data.documentPrintNum
        })
    },

    //增加份数
    addPrintNum: co.wrap(function*() {
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
    inputstartpage: function(e) {
        this.data.startPage = e.detail.value
    },

    startpagejudge: function(e) {
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

    allowSave: function(e) {
        if (!e.detail.authSetting['scope.writePhotosAlbum']) {
            return
        }
        this.setData({
            savable: true
        })
    },
    saveImg: co.wrap(function*() {
        wx.showLoading({
            title: '请稍等'
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
                    wx.hideLoading()
                    wx.showToast({
                        title: '保存成功',
                        icon: 'none'
                    })
                }
            }
        } catch (e) {
            wx.hideLoading()
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
        if(!this.hasAuthPhoneNum&&!app.hasPhoneNum){
            return
        }
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
        if(hideConfirmPrintBox){
            this.print()
        } else {
            this.setData({
                ['confirmModal.isShow']: true
            })
        }
    },
    getPhoneNumber:co.wrap(function*(e){
        yield app.getPhoneNum(e)
        wx.setStorageSync("hasAuthPhoneNum",true)
        this.hasAuthPhoneNum = true
        this.setData({
            hasAuthPhoneNum:true
        })
        this.confcheck()
    }),
    // 打印
    print: co.wrap(function*() {
        let images = [],
            startPage = Number(this.data.startPage) - 1,
            endPage = Number(this.data.endPage)
        let urls = this.data.urls.slice(startPage, endPage)
        for (let i = 0; i < urls.length; i++) {
            let tempObj = {}
            tempObj.url = urls[i]
            tempObj.pre_convert_url = urls[i]
            tempObj.color = this.data.colorcheck
            tempObj.duplex = false
            tempObj.number = this.data.documentPrintNum
            images.push(tempObj)
        }
        let params = {
            openid: app.openId,
            urls: images,
            media_type: 'search_question',
            from: 'mini_app'
        }
        wx.showLoading({
            title: '正在提交',
            mask: true
        })
        try {
            // 拍搜打印
            // const resp = yield api.printPhotoAnswer(params)
            console.log(resp)
            if (resp.code !== 0) {
                throw (resp)
            }

            wx.hideLoading()
            console.log('订单创建成功', resp)
            wx.redirectTo({
                url: `../../../finish/index?type=photo_answer&media_type=photo_answer&state=${resp.order.state}`
            })

        } catch (e) {
            wx.hideLoading()
            util.showErr(e)
        }
    }),
})
