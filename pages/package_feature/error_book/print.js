// pages/error_book/pages/error_book/print.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const common_util = require('../../../utils/common_util')
const util = require('../../../utils/util')
import modal from '../../../components/confirm-reinforce-modal/event'

const request = util.promisify(wx.request)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)
const getSetting = util.promisify(wx.getSetting)
const authorize = util.promisify(wx.authorize)
const downloadFile = util.promisify(wx.downloadFile)
const getUserInfo = util.promisify(wx.getUserInfo)
import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

Page({
    data: {
        template_id: 0,
        order: "ASC",
        template: [],
        convert_urls: [],
        width: 0,
        height: 0,
        areaHeight: '',
        num: 0,
        circular: true,
        showConfirmModal: null,
        // 0 未授权 1，授权失败， 2 已授权
        allowCamera: 0, //保存到相授权
        color: null,
        canPrintColor: false,
        answer: 2,
        selectColors: [{
                name: '黑白',
                key: 'Grays',
                id: 1,
                selected: false, //用于点击的状态
                checked: false,
            },
            {
                name: '灰度',
                key: 'Mono',
                id: 2,
                selected: false,
                checked: false,
            },
            {
                name: '全彩',
                key: 'Color',
                id: 3,
                selected: true,
                checked: true,
            }
        ],
        answer_urls: [],
        color_id: 3, //默认全彩
        percent: 0,
        showupLoad: false,
        showTitle: true,
        showContent: true,
        hasAuthPhoneNum: false,
        confirmModal: {
            isShow: false,
            title: '请正确放置A4打印纸',
            image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: co.wrap(function* (options) {
        let _this = this
        logger.info("错题打印页", options)
        _this.mistakeCount = options.mistakecount
        _this.course = options.course
        _this.ids = options.ids && JSON.parse(options.ids)
        _this.longToast = new app.Wehide()
        _this.initArea()
        _this.initColors()
        yield _this.getTemplates()
        yield _this.getDrawPic()
        yield _this.getCapability()
        _this.getAuth()
    }),
    onShow: function () {
        let hasAuthPhoneNum = Boolean(wx.getStorageSync('hasAuthPhoneNum'))
        this.hasAuthPhoneNum = hasAuthPhoneNum
        this.setData({
            hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
        })
    },
    // 初始化显示区域
    initArea: co.wrap(function* () {
        let res = wx.getSystemInfoSync()
        logger.info('系统信息', res)
        let areaWidth = res.windowWidth * (750 / res.windowWidth) - 120
        let areaHeight = res.windowHeight * (750 / res.windowWidth) - 490 - 100

        let width = areaWidth
        let height = width * 2165 / 1456
        if (height > areaHeight) {
            height = areaHeight - 20
            width = height / 2156 * 1456
        }
        logger.info('ertyjkl;', areaWidth, areaHeight, width, height)

        this.setData({
            width: width,
            height: height,
            areaWidth,
            areaWidth,
            areaHeight: areaHeight
        })
    }),
    // 初始化色彩选择属性
    initColors: co.wrap(function* () {
        const [colors] = this.data.selectColors.filter(item => item.selected)
        this.setData({
            color: colors.key
        })
    }),
    // 授权相册
    getAuth: co.wrap(function* () {
        try {
            let setting = yield getSetting()
            let camera = setting.authSetting['scope.writePhotosAlbum']
            if (camera === undefined) {
                this.allowCamera = 0
                let auth = yield authorize({
                    scope: 'scope.writePhotosAlbum'
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
    // 授权返回
    authBack: function (e) {
        if (!e.detail.authSetting['scope.writePhotosAlbum']) {
            return
        }
        this.setData({
            allowCamera: 2
        })
        this.save()
    },
    // 黑色增加提示
    showExamModal: function () {
        modal.showModal()
    },
    // 切换色彩选择
    chooseColor: function (e) {
        const _this = this
        let index = e.currentTarget.dataset.index
        let current = this.data.selectColors[index]

        if (_this.data.selectColors[index].selected) {
            return
        }
        const selectColors = this.data.selectColors.map((item, idx) => {

            item.selected = (current.key == item.key) ? true : false

            if (current.key === 'Grays') {
                if (index == idx) {
                    item.checked = true
                }
            } else {
                if (index == idx) {
                    item.checked = true
                } else {
                    item.checked = false
                }
            }
            return item
        })
        const [colors] = selectColors.filter(item => item.selected) // 只区分两种
        const [currentColors] = selectColors.filter(item => item.selected) // 获取当前选中的id
        // logger.info(colors,'colors')
        _this.setData({
            selectColors,
            color: colors.key == 'Grays' ? 'Mono' : colors.key,
            color_id: currentColors.id
        })
        _this.getDrawPic() //绘制合成图片
    },
    // 获取绘制的合成图片
    getDrawPic: co.wrap(function () {
        let _this = this
        let _key = `${_this.data.template_id}-${_this.data.color_id}`
        let printData = wx.getStorageSync(`printData`)
        if (printData) { // 本地获取图片
            printData = JSON.parse(printData)
            if (printData[_key]) {
                return _this.setData({
                    convert_urls: printData[_key].convert_urls,
                    num: 0,
                    answer_urls: printData[_key].answer_urls
                })
            }
        }
        _this.getBlackEnhanceSn() //请求获取新的合成图片
    }),
    // 获取编辑需要的sn
    getBlackEnhanceSn: co.wrap(function* () {
        this.longToast.toast({
            img: '/images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        try {
            const [colors] = this.data.selectColors.filter(item => item.selected) // 需要区分三种
            let worker_data = {
                ids: this.ids,
                order: this.data.order,
                course: this.course,
                template_id: this.data.template_id ? this.data.template_id : this.data.template[0] && this.data.template[0].id,
                media_type: 'pic2doc',
            }

            if (colors.key == 'Grays') {
                worker_data.bw = true
                worker_data.gray = false
            } else {
                worker_data.gray = colors.key == 'Color' ? false : true
            }
            const resp = yield request({
                url: app.apiServer + '/boxapi/v2/workers',
                method: 'POST',
                dataType: 'json',
                data: {
                    openid: app.openId,
                    handle: 'mistake_convert',
                    worker_data,
                }
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            this.longToast.hide()
            if (resp.data.res && resp.data.res.sn) {
                this.getLoopsPic(resp.data.res.sn)
            }
        } catch (err) {
            this.longToast.hide()
            logger.info(err);
        }
    }),
    // 绘制图片服务
    drawRequest: function (sn_key) {
        return new Promise(co.wrap(function* (resolve, reject) {
            const resp = yield request({
                url: app.apiServer + `/boxapi/v2/workers/${sn_key}`,
                method: 'GET',
                dataType: 'json'
            })
            if (resp.data.code != 0) {
                reject(resp.data)
            } else {
                resolve(resp.data && resp.data.res)
            }
        }))
    },
    // 轮询绘制编辑图片
    getLoopsPic: function (sn) {
        try {
            const nowTime = new Date(); // 初始化开始时间
            const _this = this;
            _this.setData({
                showupLoad: true
            }) //显示进度modal
            _this.requestAnimationPercent() //模拟动画进度
            _this.timer = setInterval(() => {
                let carryTime = new Date() //执行时间
                if (carryTime - nowTime > 60000) { //判断处理大于12秒  提示处理失败
                    _this.timer && clearInterval(_this.timer)
                    _this.setData({
                        percent: 0,
                        showupLoad: false
                    })
                    return util.showError({
                        message: '图片处理失败, 请重新尝试!'
                    })
                }
                // 开启绘制
                _this.drawRequest(sn).then(res => {
                    if (res.state === 'processing') { // 处理中
                        return _this.setData({
                            percent: this.data.percent + 30
                        })
                    }
                    _this.timer && clearInterval(_this.timer) //关闭定时
                    _this.setData({
                        percent: 0,
                        showupLoad: false
                    })

                    if (res.state === 'finished') {
                        let printData = wx.getStorageSync(`printData`)
                        let _key = `${_this.data.template_id}-${_this.data.color_id}`

                        printData = printData ? JSON.parse(printData) : {}

                        printData[`${_key}`] = {
                            convert_urls: res.worker_data.urls,
                            answer_urls: res.worker_data && res.worker_data.answer_urls ? res.worker_data.answer_urls : [],
                        }

                        wx.setStorageSync(`printData`, JSON.stringify(printData))

                        _this.setData({
                            convert_urls: res.worker_data.urls,
                            num: 0,
                            answer_urls: res.worker_data.answer_urls ? res.worker_data.answer_urls : []
                        })
                    } else if (res.state === 'failed') {
                        util.showError({
                            message: '绘制有误'
                        })
                    } else {
                        logger.info('drawRequest exclude state: ', res)
                    }
                })
            }, 3000)
        } catch (err) {
            logger.info(`draw Pic Error =`, err);
        }
    },
    // 首次模拟动画效果
    requestAnimationPercent: function () {
        let _this = this
        var timer = setInterval(() => {
            if (_this.data.percent > 30) {
                return clearInterval(timer)
            }
            _this.setData({
                percent: _this.data.percent + 1
            })
        }, 500)
    },
    // 取消绘制黑白增加图片
    cancelDraw: function () {
        let _this = this
        _this.setData({
            showupLoad: false,
            percent: 0,
        })
        _this.timer && clearInterval(_this.timer)
    },
    changeAnswer: co.wrap(function* (e) {
        let id = e.currentTarget.id
        if (id == this.data.answer) {
            return
        }
        this.setData({
            answer: id
        })
        logger.info(this.data.answer)
    }),
    //获取打印能力
    getCapability: co.wrap(function* () {
        this.longToast.toast({
            img: '/images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        try {
            const resp = yield request({
                url: app.apiServer + `/ec/v2/apps/printer_capability`,
                method: 'GET',
                dataType: 'json',
                data: {
                    openid: app.openId
                }
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            this.longToast.hide()
            if (resp.data.print_capability.color_modes.length < 2) {
                let selectColors = this.data.selectColors
                selectColors.splice(2, 1)
                selectColors[selectColors.length - 1].selected = true
                this.setData({
                    selectColors: selectColors
                })
            }
            // this.setData({
            //     canPrintColor: resp.data.print_capability.color_modes.length == 2 ? true : false,
            // })
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }
    }),
    tab_slide: function (e) {
        logger.info(e.detail.current)
        this.setData({
            num: e.detail.current
        })
    },
    turnImg: co.wrap(function* (e) {
        let num = this.data.num;
        let turn = e.currentTarget.dataset.turn;
        if (turn == 'right') {
            if (num < this.data.convert_urls.length - 1) {
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
    // 获取模板
    getTemplates: co.wrap(function* (e) {
        this.longToast.toast({
            img: '/images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        try {
            const resp = yield request({
                url: app.apiServer + `/ec/v2/mistake_templates`,
                method: 'GET',
                dataType: 'json'
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            logger.info('打印模板====', resp.data)
            let template_id = ''
            if (resp.data.mistake_template && resp.data.mistake_template[0]) {
                template_id = resp.data.mistake_template[0].id
            }
            this.setData({
                template: resp.data.mistake_template,
                template_id: template_id
            })
            this.longToast.hide()
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }
    }),
    // 切换模板
    changeTemp: co.wrap(function* (e) {
        try {
            let index = e.currentTarget.id
            let id = this.data.template[index].id
            this.setData({
                template_id: id
            })
            this.getDrawPic()
        } catch (err) {
            logger.info(err)
        }
    }),

    //打印
    quickPrint: function (e) {
        if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
            return
        }
        let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
        if (hideConfirmPrintBox) {
            this.confirmPrint()
        } else {
            this.setData({
                ['confirmModal.isShow']: true
            })
        }
    },
    getPhoneNumber: co.wrap(function* (e) {
        yield app.getPhoneNum(e)
        wx.setStorageSync("hasAuthPhoneNum", true)
        this.hasAuthPhoneNum = true
        this.setData({
            hasAuthPhoneNum: true
        })
        this.quickPrint(e)
    }),
    confirmPrint: co.wrap(function* (e) {
        let info
        try {
            info = yield getUserInfo()
        } catch (error) {
            logger.info('error==', error)
            return
        }

        this.setData({
            avatarUrl: info.userInfo.avatarUrl,
            nickName: info.userInfo.nickName

        })
        this.longToast.toast({
            type: 'loading'
        })

        let link = []
        for (let i = 0; i < this.data.convert_urls.length; i++) {
            let urls = {}
            urls.url = this.data.convert_urls[i]
            urls.pre_convert_url = this.data.convert_urls[i]
            urls.color = "Color"
            urls.number = "1"
            link.push(urls)
        }
        if (this.data.answer_urls.length > 0 && this.data.answer == 1) {
            for (let i = 0; i < this.data.answer_urls.length; i++) {
                let urls = {}
                urls.url = this.data.answer_urls[i]
                urls.pre_convert_url = this.data.answer_urls[i]
                urls.color = this.data.color
                urls.number = "1"
                link.push(urls)
                logger.info("1111111", link)
            }
        }

        let params2 = {
            openid: app.openId,
            media_type: "mistake",
            urls: link,
            mistake_ids: this.ids,
            user_statistics: {
                mistake_count: this.mistakeCount
            }
        }
        try {
            const resp = yield request({
                url: app.apiServer + `/ec/v2/orders`,
                method: 'POST',
                dataType: 'json',
                data: params2
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            logger.info('打印====', resp.data)
            router.redirectTo('/pages/finish/index', {

                })
            // wx.redirectTo({
            //     url: `../../../finish/oral_mistake_index?media_type=mistake&state=${resp.data.order.state}&avatarUrl=${this.data.avatarUrl}&nickName=${this.data.nickName}&count=${resp.data.statistics.count}&printed_count=${resp.data.statistics.printed_count}&user_share_qrcode=${common_util.encodeLongParams(resp.data.qrcode)}&course=${this.course}`
            // })
            this.longToast.hide()
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }
    }),
    save: co.wrap(function* (e) {

        wx.showLoading({
            title: '请稍后',
            mask: true
        })
        try {
            for (var i = 0; i < this.data.convert_urls.length; i++) {
                let downLoadData = yield downloadFile({
                    url: this.data.convert_urls[i]
                })
                let save = yield saveImageToPhotosAlbum({
                    filePath: downLoadData.tempFilePath
                })
                if (i == (this.data.convert_urls.length - 1)) {
                    wx.hideLoading()
                    wx.showToast({
                        title: '保存成功',
                        icon: 'none'
                    })
                }
            }
        } catch (e) {
            logger.info(e)
            wx.hideLoading()
            wx.showModal({
                title: '错误',
                content: '保存失败',
                showCancel: false,
                confirmColor: '#6BA1F6'
            })
        }
    }),
    previewImg: function (e) {
        wx.previewImage({
            current: this.data.convert_urls[this.data.num],
            urls: this.data.convert_urls
        })
    },
    onUnload: function () {
        wx.removeStorageSync('printData')
    },
    onHide: function () {
        wx.removeStorageSync('printData')
    }
})