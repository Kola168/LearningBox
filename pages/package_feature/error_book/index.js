// pages/error_book/index.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const event = require('../../../lib/event/event')
import router from '../../../utils/nav'
import featureGql from '../../../network/graphql/feature'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import {
    storage
} from '../../../utils/common_import'
const getSetting = util.promisify(wx.getSetting)
const authorize = util.promisify(wx.authorize)

Page({
    data: {
        // 0 未授权 1，授权失败， 2 已授权
        allowCamera: 0, //相机授权
        activePeriodIndex: 0,
        subjectList:  [{
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
    ],
        showTipModal: false,
        from_temp: false,
        mediumRecommend: '',
        showIntrol: '',
        from_temp: false,
        butHigh:false
    },
    onShow: co.wrap(function* () {
        let authToken = storage.get('authToken')
        if (!authToken) {
            let url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
            if (this.share_user_id) {
                router.navigateTo('/pages/authorize/index', {
                    share_user_id: this.share_user_id,
                    way: this.way
                })
            } else {
                router.navigateTo('/pages/authorize/index', )
            }
        } else{
            yield this.getSubjects()
        }
    }),
    onLoad: co.wrap(function* (options) {
        event.on('Authorize', this, function (data) {
            this.setData({
                showIntro: false
            })
            this.getAuth()
        })
        if (app.isFullScreen) {
            this.setData({
              butHigh: true
            })
          } else if (app.isFullScreen == undefined) {
            let that = this
            setTimeout(function () {
              that.setData({
                butHigh: app.isFullScreen
              })
            }, 500)
          }
        let errorBook = wx.getStorageSync('errorBook')
        logger.info('错题本', errorBook)

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
        //     logger.info(supply_types)
        //     that.setData({
        //         supply_types: supply_types
        //     })
        // })
        //分享进来的逻辑
        // this.way = 1
        if (options.scene) {
            let fromScene = decodeURIComponent(options.scene)
            let scene = fromScene.split('_')
            this.from = scene[0]
            if (this.from == 'application') {
                this.share_user_id = scene[1]
                // this.way = 5
                logger.info('错题本应用二维码参数', this.share_user_id, this.way)
                this.setData({
                    from_temp: true
                })
            }
        }
    }),
    toCamera: co.wrap(function* () {
        if (this.data.allowCamera != 2) {
            return
        }
        router.navigateTo('/pages/package_feature/error_book/camera?', {
            type: `error_book`
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
            logger.info(' 0 未授权 1，授权失败， 2 已授权', this.allowCamera)
        } catch (e) {
            logger.info('获取授权/授权失败', e)
            this.allowCamera = 1
            this.setData({
                allowCamera: this.allowCamera
            })
        }
    }),
    authBack: function (e) {
        logger.info(e)
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
    //获取当前学段的学科和错题数
    getSubjects: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            const resp = yield featureGql.getErrorSubjects()
            let subjectList = this.data.subjectList
            let mistakes = resp.mistakes
            subjectList.forEach(data=>{
                mistakes.forEach(vata=>{
                    if(data.name==vata.object){
                        data.count=vata.count
                    }
                })   
            })
            this.setData({
                subjectList
            })
            this.longToast.hide()
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }
    }),
    toList: function (e) {
        let item = this.data.subjectList[e.currentTarget.id]
        router.navigateTo('/pages/package_feature/error_book/detail', {
            course: item.name
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
    toNextPage: function () {
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