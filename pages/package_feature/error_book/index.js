// pages/error_book/index.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const event = require('../../../lib/event/event')
import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'
import {
    storage
} from '../../../utils/common_import'
const request = util.promisify(wx.request)
const getSetting = util.promisify(wx.getSetting)
const authorize = util.promisify(wx.authorize)
import commonRequest from '../../../utils/common_request.js'

Page({
    data: {
        // 0 未授权 1，授权失败， 2 已授权
        allowCamera: 0, //相机授权
        activePeriodIndex:0,
        allSubjects: [[{
                name: '语文',
                id: 'yuwen'
            },
            {
                name: '数学',
                id: 'shuxue'
            }, {
                name: '英语',
                id: 'yingyu'
            },
            {
                name: '物理',
                id: 'wuli'
            }, {
                name: '化学',
                id: 'huaxue'
            }, {
                name: '生物',
                id: 'shengwu'
            }, {
                name: '政治',
                id: 'zhengzhi'
            }, {
                name: '历史',
                id: 'lishi'
            }, {
                name: '地理',
                id: 'dili'
            }
        ]], //依次为小学初中高中
        subjectList: [],
        showTipModal: false,
        from_temp: false,
        mediumRecommend: '',
        showIntrol: '',
        from_temp: false
    },
    onShow: co.wrap(function* () {
        yield this.getGrade()
    }),
    onLoad: co.wrap(function* (options) {
        event.on('Authorize', this, function (data) {
            this.setData({
                showIntro: false
            })
            this.getAuth()
        })
        let errorBook = wx.getStorageSync('errorBook')
        console.log('错题本', errorBook)

        if (!errorBook) {
            this.setData({
                showIntro: true
            })
        } else {
            this.setData({
                showIntro: false
            })
            this.getAuth()
        }

        if (!errorBook || !errorBook.hideHomeTip) {
            this.setData({
                showTipModal: true
            })
        }
        this.longToast = new app.weToast()
        let refer = wx.getLaunchOptionsSync()
        let media_type = 'mistake'
        // this.setData({
        //     mediumRecommend: media_type
        // })
        // commonRequest.getSupplyBefore(media_type)
        // let getSupplyBefore = commonRequest.getSupplyBefore(media_type)
        // let that = this
        // getSupplyBefore.then(function (res) {
        //     const supply_types = res.supply_types
        //     console.log(supply_types)
        //     that.setData({
        //         supply_types: supply_types
        //     })
        // })
        //分享进来的逻辑
        this.way = 1
        if (options.scene) {
            let fromScene = decodeURIComponent(options.scene)
            console.log("4567890错题本", fromScene)
            let scene = fromScene.split('_')
            this.from = scene[0]
            if (this.from == 'application') {
                this.share_user_id = scene[1]
                this.way = 5
                console.log('错题本应用二维码参数', this.share_user_id, this.way)
                this.setData({
                    from_temp: true
                })
            }
        }
    }),
    backToHome: function () {
        try {
            wx.switchTab({
                url: '../../../index/index'
            })
        } catch (e) {
            console.log(e)
        }

    },
    toCamera: co.wrap(function* () {
        if (this.data.allowCamera != 2) {
            return
        }
        router.navigateTo('/pages/package_feature/error_book/camera?', {
            from: `error_book`
        })
    }),
    getAuth: co.wrap(function* () {
        try {
            let setting = yield getSetting()
            let camera = setting.authSetting['scope.camera']
            if (camera === undefined) {
                this.allowCamera = 0
                let auth = yield authorize({
                    scope: 'scope.camera'
                })
                this.allowCamera = 2
            } else if (camera === false) {
                this.allowCamera = 1
            } else {
                this.allowCamera = 2
            }
            this.setData({
                allowCamera: this.allowCamera
            })
            console.log(' 0 未授权 1，授权失败， 2 已授权', this.allowCamera)
        } catch (e) {
            console.log('获取授权/授权失败', e)
            this.allowCamera = 1
            this.setData({
                allowCamera: this.allowCamera
            })
        }
    }),
    authBack: function (e) {
        console.log(e)
        if (!e.detail.authSetting['scope.camera']) {
            return
        }
        this.setData({
            allowCamera: 2
        })
        router.navigateTo('/pages/package_feature/error_book/camera?', {
            from: `error_book`
        })
    },
    // 获取年级信息
    getGrade: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            let resp = yield gql.getGrade()
            this.setData({
                activeGrade: resp.currentUser.selectedKid.stage.name
            })
            this.longToast.hide()
        } catch (error) {
            this.longToast.hide()
        }
    }),
    //获取当前学段的学科和错题数
    getSubjects: co.wrap(function* () {
        try {
            const resp = yield request({
                url: app.apiServer + `/ec/v2/mistakes?${app.openId}`,
                method: 'GET',
                dataType: 'json',
                data: {
                    'openid': app.openId,
                }
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            console.log('错题科目列表====', resp.data)
            this.setData({
                subjectList: resp.data.mistakes
            })
            this.longToast.toast()
        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }
    }),
    toList: function (e) {
        let index = e.currentTarget.id
        let item = this.data.allSubjects[this.data.activePeriodIndex]
        wx.navigateTo({
            url: `detail?grade=${this.data.activeGrade}&course=${item[index].name}`
        })
    },
    hideTipModal: function () {
        let errorBook = wx.getStorageSync('errorBook')
        if (!errorBook) {
            errorBook = {}
        }
        errorBook.hideHomeTip = true
        wx.setStorageSync('errorBook', errorBook)
        this.setData({
            showTipModal: false
        })
    },
    toUsePage: function () {
        router.navigateTo('/pages/package_feature/error_book/use_page')
    },
    backToHome: function () {
        wx.switchTab({
            url: '../../../index/index'
        })
    },
    toNextPage: function () {
        let userSn = storage.get('userSn')
        if (!userSn) {
            let url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
            if (this.share_user_id) {
                router.navigateTo('/pages/authorize/index', {
                    share_user_id: this.share_user_id,
                    way: this.way
                })
            } else {
                router.navigateTo('/pages/authorize/index', )
            }
        } else {
            let errorBook = {
                hideIntro: true,
                hideHomeTip: false,
                hideCameraTip: false
            }
            wx.setStorageSync('errorBook', errorBook)
            this.setData({
                showIntro: false
            })
            this.getAuth()
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    onUnload: function () {
        event.remove('Authorize', this)
    }
})