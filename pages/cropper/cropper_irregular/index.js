//index.js
"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
var mta = require('../../utils/mta_analysis.js');

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const getImageInfo = util.promisify(wx.getImageInfo)

const device = wx.getSystemInfoSync()
const W = device.windowWidth
const H = device.windowHeight - 100

let cropper = require('welCropper.js');

console.log(device)

Page({
    data: {},
    onLoad: function (options) {
        var that = this
        this.options = options
        console.log('错题本编辑页参数', this.options)
        this.from = options.from
        this.longToast = new app.WeToast()
        cropper.init.apply(that, [W, H]);
        this.selectTap()
        mta.Page.init()
    },
    selectTap(e) {
        let that = this
        // let mode = e.currentTarget.dataset.mode
        // wx.chooseImage({
        //     count: 1,
        //     sizeType: ['original', 'compressed'],
        //     sourceType: ['album', 'camera'],
        //     success(res) {
        // const tempFilePath = res.tempFilePaths[0]

        const tempFilePath = this.options.url
        let mode = this.options.mode
        wx.getImageInfo({
            src: tempFilePath,
            success(res) {
                let imageInfo = res
                console.log('图片旋转信息======', res.orientation, res)
                if (imageInfo.width > 6000 || imageInfo.height > 6000) {
                    wx.showModal({
                        title: '提示',
                        content: '图片尺寸过大，请重新选择',
                        showCancel: false,
                        confirmColor: '#2086ee',
                        success(res) {

                        }
                    })
                    return
                }
                if (imageInfo.width < 300 || imageInfo.height < 300) {
                    wx.showModal({
                        title: '提示',
                        content: '图片尺寸过小，请重新选择',
                        showCancel: false,
                        confirmColor: '#2086ee',
                        success(res) { }
                    })
                    return
                }
                that.showCropper({
                    src: tempFilePath,
                    mode: mode,
                    from: that.from,
                    // sizeType: ['original', 'compressed'],
                    sizeType: ['original'], //强制原图
                    maxLength: 2500, //限制最大像素为2500像素
                    callback: (res) => {
                        if (mode == 'rectangle') {
                            console.log("crop callback:" + res)
                            // wx.previewImage({
                            //     current: '',
                            //     urls: [res]
                            // })
                            that.uploadImage(res)
                        } else {
                            that.getPic(res, tempFilePath)
                        }
                        // that.hideCropper()
                    }
                })
            }
        })
        //     }
        // })
    },

    //非规则矩形裁切做透视变换
    getPic: co.wrap(function* (res, tempUlr) {
        this.longToast.toast({
            img: '../../images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        let imgUrl = yield app.uploadImage(tempUlr)
        console.log('imgUrl----==========', imgUrl)
        try {
            const resp = yield request({
                url: 'http://cvt.dc.gongfudou.com/v1/2jpg',
                method: 'POST',
                dataType: 'json',
                data: {
                    'url': imgUrl,
                    'tlx': res[0][0], //左上
                    'tly': res[0][1],
                    'trx': res[3][0], //右上
                    'try': res[3][1],
                    'blx': res[1][0], //左下
                    'bly': res[1][1],
                    'brx': res[2][0], //右下
                    'bry': res[2][1],
                    'gray': true,
                    'transform': true
                }
            })

            console.log('获取图片', resp.data)
            if (!resp.data.status) {
                throw (resp.data)
            }

            wx.previewImage({
                current: '',
                urls: [resp.data.url]
            })
            this.longToast.toast()

        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }
    }),

    //上传图片
    uploadImage: co.wrap(function* (tempUlr) {
        console.log('tempUlr=======', tempUlr)
        this.longToast.toast({
            img: '../../images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        let imgUrl = yield app.uploadImage(tempUlr)
        console.log('imgUrl----==cdn========', imgUrl)
        this.longToast.toast()
        this.hideCropper()
        let from = this.from
        //再次编辑、上传多张图
        if (from == 'topic_details') {
            let pages = getCurrentPages()
            let prevPage
            let CameraContext = wx.createCameraContext()
            prevPage = pages[pages.length - 2]
            let urls = prevPage.data.urls
            urls.push(imgUrl)
            prevPage.setData({
                urls: urls
            })
            wx.navigateBack()
            return
            // 拍照搜题
        } else if (from === 'photoAnswer') {
            wx.redirectTo({
                url: `../error_book/pages/photo_answer/result?url=${imgUrl}&type=photoAnswer`
            })
        } else {
            //首张图
            mta.Event.stat('error_book', { 'cropperfix': 'true' })
            wx.redirectTo({
                url: `../error_book/pages/error_book/topic_details?url=${imgUrl}`
            })
        }

    }),
})