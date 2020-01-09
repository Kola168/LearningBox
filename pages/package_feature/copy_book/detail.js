// pages/print_copybook/detail.js
"use strict"
const app = getApp()

import api from '../../../../network/api'
import {
    regeneratorRuntime,
    co,
    util,
    _,
    common_util
} from '../../../../utils/common_import'

const request = util.promisify(wx.request)
const downloadFile = util.promisify(wx.downloadFile)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)
const getUserInfo = util.promisify(wx.getUserInfo)
var mta = require('../../../../utils/mta_analysis.js')
const event = require('../../../../lib/event/event')


Page({
    data: {
        tabId: 1,
        custom: false, //是否自定义
        num: 0,
        circular: true,
        showConfirmModal: false,
        // user_custom: false, //是否用户分享自定义
        from_temp: false, //是否分享链接进入
        showGetModal: false,
        normalImages: '',
        strokeImages: '',
        hasAuthPhoneNum:false,
        confirmModal: {
            isShow: false,
            title: '请正确放置A4打印纸',
            image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
        }
    },
    onLoad: co.wrap(function*(options) {
        this.longToast = new app.WeToast()
        mta.Page.init()
        console.log('options========', options)

        if (options.share_user_id) {
            console.log('options.share_user_id=detail===', options.share_user_id)
            this.share_user_id = options.share_user_id,
                this.way = 5
            mta.Event.stat("zitie_share_to_practice", {})

        }

        //分享链接进入
        if (options.from && options.from == 'share') {
            wx.setNavigationBarTitle({
                title: '字帖',
            })
            this.setData({
                from_temp: true
            })
            if (options.custom == "true") {
                this.setData({
                    custom: true
                })
            }
        } else {
            wx.setNavigationBarTitle({
                title: options.title,
            })
        }
        this.setData({
            images: options.images ? common_util.decodeLongParams(options.images) : '',
            user_share_qrcode: options.user_share_qrcode ? common_util.decodeLongParams(options.user_share_qrcode) : '',
            sn: options.sn,
            name: options.name ? options.name : '',
            pdf_url: (options.pdf_url && options.pdf_url != 'undefined') ? common_util.decodeLongParams(options.pdf_url) : '',
            word_count: options.word_count ? options.word_count : '',
            custom: options.custom ? options.custom : false,
            tabId: 1
        })
        console.log("22222222")
        if (options.title != '自定义练习') {
            let unionId = wx.getStorageSync('unionId')
            if (unionId) {
                yield this.copybookDetails()
            }

            event.on('Authorize', this, function(data) {
                this.copybookDetails()
            })
        }
        let userId = wx.getStorageSync('userId')
        if (userId == undefined || userId == '') {
            yield this.loopOpenId()
        } else {
            this.user_id = userId
        }
    }),
    onShow: function() {
        let hasAuthPhoneNum = Boolean(wx.getStorageSync('hasAuthPhoneNum'))
        this.hasAuthPhoneNum = hasAuthPhoneNum
        this.setData({
            hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
        })
        let unionId = wx.getStorageSync('unionId')
        console.log('应用二维码参数传参', this.share_user_id, this.way)
        if (!unionId) {
            let url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
            wx.navigateTo({
                url: url,
            })
        }
    },
    copybookDetails: co.wrap(function*(e) {
        this.longToast.toast({
            img: '/images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        try {
            console.log("copybookDetails", app.openId, this.data.custom, this.data.sn)
            const resp = yield api.copy_booksDetail(app.openId, this.data.custom, this.data.sn)
            if (resp.code != 0) {
                throw (resp)
            }
            console.log('字帖详情', resp)
            this.setData({
                multiple_form: resp.res.multiple_form, //判断是否有笔顺
                word_count: resp.res.word_count, //字数
                practiceImages: resp.res.images
            })

            let normalImages = resp.res.images.normal_images
            let strokeImages = resp.res.images.stroke_images
            this.setData({
                images: parseInt(this.data.tabId) === 0 || normalImages == null || normalImages == '' ? strokeImages : normalImages,
                normalImages: normalImages,
                strokeImages: strokeImages
            })

            this.longToast.toast()
        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }
    }),

    practice: co.wrap(function*(e) {
        let id = e.currentTarget.id
        console.log(id)
        this.setData({
            tabId: id,
            images: parseInt(id) === 0 ? this.data.strokeImages : this.data.normalImages,
            num: 0
        })
    }),

    tab_slide: function(e) {
        console.log(e.detail.current)
        this.setData({
            num: e.detail.current
        })
    },

    turnImg: co.wrap(function*(e) {
        let num = this.data.num;
        let turn = e.currentTarget.dataset.turn;
        if (turn == 'right') {
            if (num < this.data.images.length - 1) {
                num++;
            } else {
                return
            }
        } else if (turn == 'left') {
            if (num > 0) {
                num--;
            } else {
                return
            }
        }
        this.setData({
            num: num,
            turn: turn
        })
    }),

    onShareAppMessage: function(res) {
        mta.Event.stat("zitie_datail_share", {})
        if (res.from === 'button' || res[0].from === 'button') {
            console.log('c随时随地======', `/pages/error_book/pages/copy_book/detail?sn=${this.data.sn}&custom=${this.data.custom}&from=share&share_user_id=${this.user_id}`)
            return {
                title: "分享一个好用又方便的字帖应用给你！",
                path: `/pages/error_book/pages/copy_book/detail?sn=${this.data.sn}&custom=${this.data.custom}&from=share&share_user_id=${this.user_id}`
            }
        } else {
            return app.share
        }
    },

    toSave: co.wrap(function*() {
        let sn = this.data.sn
        mta.Event.stat("zitie_save", sn)
        wx.showLoading({
            title: '请稍后',
            mask: true
        })
        try {
            for (var i = 0; i < this.data.images.length; i++) {
                let downLoadData = yield downloadFile({
                    url: this.data.images[i]
                })
                let save = yield saveImageToPhotosAlbum({
                    filePath: downLoadData.tempFilePath
                })
                if (i == (this.data.images.length - 1)) {
                    wx.hideLoading()
                    wx.showToast({
                        title: '保存成功',
                        icon: 'none'
                    })
                }
            }
        } catch (e) {
            console.log(e)
            wx.hideLoading()
            wx.showModal({
                title: '错误',
                content: '保存失败',
                showCancel: false,
                confirmColor: '#6BA1F6'
            })
        }

    }),

    toConfirm: co.wrap(function*(e) {
        if(!this.hasAuthPhoneNum&&!app.hasPhoneNum){
            return
        }
        if (this.data.custom) {
            mta.Event.stat('zitie_print', {
                'zidinyi': this.data.sn
            })
        } else {
            mta.Event.stat('zitie_print', {
                'common': this.data.sn
            })
        }
        let info
        try {
            info = yield getUserInfo()
        } catch (error) {
            console.log('error==', error)
            return
        }
        this.setData({
            avatarUrl: info.userInfo.avatarUrl,
            nickName: info.userInfo.nickName
        })
        let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
        if(hideConfirmPrintBox){
            this.print()
        } else {
            this.setData({
                ['confirmModal.isShow']: true
            })
        }
    }),
    getPhoneNumber:co.wrap(function*(e){
        yield app.getPhoneNum(e)
        wx.setStorageSync("hasAuthPhoneNum",true)
        this.hasAuthPhoneNum = true
        this.setData({
            hasAuthPhoneNum:true
        })
        this.toConfirm(e)
    }),

    print: co.wrap(function*() {
        this.longToast.toast({
            img: '/images/loading.gif',
            title: '请稍候',
            duration: 0
        })

        let link = []
        if (this.data.custom) {
            let obj = {}
            obj.url = this.data.pdf_url
            obj.color = "Color"
            obj.number = "1"
            link.push(obj)
        } else {
            for (let i = 0; i < this.data.images.length; i++) {
                let obj = {}
                obj.url = this.data.images[i]
                obj.pre_convert_url = this.data.images[i]
                obj.color = "Color"
                obj.number = "1"
                link.push(obj)
            }
        }
        let resp
        try {
            if (this.data.custom) {
                resp = yield api.printCopybook(app.openId, 'custom_copy_book', link, this.data.word_count)
            } else {
                resp = yield api.printCopybook(app.openId, 'copy_book', link, this.data.word_count)
            }
            if (resp.code != 0) {
                throw (resp)
            }
            console.log('提交打印成功', resp)
            this.longToast.toast()
            wx.redirectTo({
                url: `/pages/finish/oral_mistake_index?type=copy_book&media_type=copy_book&state=${resp.order.state}&day_count=${resp.statistics.day_count}&word_count=${resp.statistics.word_count}&print_count=${resp.statistics.print_count}&user_share_qrcode=${common_util.encodeLongParams(this.data.user_share_qrcode)}&avatarUrl=${this.data.avatarUrl}&nickName=${this.data.nickName}`
            })
        } catch (e) {
            util.hideToast(this.longToast)
            util.showErr(e)
        }
    }),

    backToHome: function() {
        try {
            wx.switchTab({
                url: '../../../index/index'
            })
        } catch (e) {
            console.log(e)
        }
    },

    //有用 试一试
    toCopybook: function(e) {
        mta.Event.stat("zitie_try", {})
        wx.navigateTo({
            url: `index`,
        })
    },

    onUnload: function() {
        event.remove('Authorize', this)
    },

    loopOpenId: co.wrap(function*() {
        let loopCount = 0
        let _this = this
        if (app.openId) {
            console.log('openId++++++++++++----', app.openId)
            _this.getUserId()
        } else {
            setTimeout(function() {
                loopCount++
                if (loopCount <= 100) {
                    console.log('openId not found loop getting...')
                    _this.loopOpenId()
                } else {
                    console.log('loop too long, stop')
                }
            }, 1000)
        }
    }),

    getUserId: co.wrap(function*() {
        try {
            const resp = yield request({
                url: app.apiServer + `/ec/v2/users/user_id`,
                method: 'GET',
                dataType: 'json',
                data: {
                    openid: app.openId
                }
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            console.log('获取user_id', resp.data)
            this.user_id = resp.data.user_id
            wx.setStorageSync('userId', this.user_id)
        } catch (e) {
            // util.showErr(e)
        }
    }),

})
