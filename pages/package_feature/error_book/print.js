// pages/error_book/pages/error_book/print.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const common_util = require('../../../utils/common_util')
const util = require('../../../utils/util')
import modal from '../../../components/confirm-reinforce-modal/event'
import commonRequest from '../../../utils/common_request'
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
import getLoopsEvent from '../../../utils/worker'

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
            // {
            //     name: '灰度',
            //     key: 'Mono',
            //     id: 2,
            //     selected: false,
            //     checked: false,
            // },
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
        console.log("错题打印页", options)
        _this.mistakeCount = options.mistakecount
        _this.course = options.course
        _this.ids = options.ids && JSON.parse(options.ids)
        _this.longToast = new app.weToast()
        _this.initArea()
        _this.initColors()
        yield _this.getTemplates()
        yield _this.getDrawPic()
        // yield _this.getCapability()
        _this.getAuth()
    }),
    onShow: function () {},
    // 初始化显示区域
    initArea: co.wrap(function* () {
        let res = wx.getSystemInfoSync()
        console.log('系统信息', res)
        let areaWidth = res.windowWidth * (750 / res.windowWidth) - 120
        let areaHeight = res.windowHeight * (750 / res.windowWidth) - 490 - 100

        let width = areaWidth
        let height = width * 2165 / 1456
        if (height > areaHeight) {
            height = areaHeight - 20
            width = height / 2156 * 1456
        }
        console.log('ertyjkl;', areaWidth, areaHeight, width, height)

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
            console.log(' 0 未授权 1，授权失败， 2 已授权', this.allowCamera)
        } catch (e) {
            console.log('获取授权/授权失败', e)
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
        // console.log(colors,'colors')
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
            type: 'loading'
        })
        try {
            const [colors] = this.data.selectColors.filter(item => item.selected) // 需要区分三种
            let worker_data = {
                is_async: true,
                ids: this.ids,
                course: this.course,
                template_id: this.data.template_id ? this.data.template_id : this.data.template[0] && this.data.template[0].id,
            }
            if (colors.key == 'Grays') {
                worker_data.bw = true
                worker_data.gray = false
            } else {
                worker_data.gray = colors.key == 'Color' ? false : true
            }
            console.log('0000000', worker_data)
            this.longToast.toast({
                type: 'loading'
            })
            try {
                getLoopsEvent({
                    feature_key: 'mistake',
                    worker_data: worker_data
                }, (resp) => {
                    this.longToast.hide()
                    this.getLoopsPic(resp)
                }, () => {
                    this.longToast.hide()
                })
            } catch (err) {
                console.log(err)
                this.longToast.hide()
                util.showError(err)
            }
        } catch (err) {
            this.longToast.hide()
            console.log(err);
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
    getLoopsPic: function (res) {
        try {
            // const nowTime = new Date(); // 初始化开始时间
            const _this = this;
            _this.setData({
                showupLoad: true
            }) //显示进度modal
            _this.requestAnimationPercent() //模拟动画进度
            if (res.status == 'timeout') {
                _this.setData({
                    percent: 0,
                    showupLoad: false
                })
                return util.showError({
                    message: res.message
                })
            }
            if (res.status === 'processing') { // 处理中
                return _this.setData({
                    percent: this.data.percent + 30
                })
            }
            _this.timer && clearInterval(_this.timer) //关闭定时
            _this.setData({
                percent: 0,
                showupLoad: false
            })

            if (res.status === 'finished') {
                console.log('34567890', res)
                let printData = wx.getStorageSync(`printData`)
                let _key = `${_this.data.template_id}-${_this.data.color_id}`

                printData = printData ? JSON.parse(printData) : {}

                printData[`${_key}`] = {
                    convert_urls: res.data.urls,
                    answer_urls: res.data && res.data.answer_urls ? res.data.answer_urls : [],
                }

                wx.setStorageSync(`printData`, JSON.stringify(printData))

                _this.setData({
                    convert_urls: res.data.urls,
                    num: 0,
                    answer_urls: res.data.answer_urls ? res.data.answer_urls : []
                })
            } else if (res.status === 'failed') {
                util.showError({
                    message: '绘制有误'
                })
            } else {
                console.log('drawRequest exclude state: ', res)
            }
        } catch (err) {
            console.log(`draw Pic Error =`, err);
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
        console.log(this.data.answer)
    }),
    //获取打印能力
    getCapability: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            var resp = yield commonRequest.getPrinterCapacity('doc_a4') //获取打印能力数据//获取打印能力
            if (!resp) {
                return
            }
            this.longToast.hide()
            if (!resp.color) {
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
        console.log(e.detail.current)
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
            type: 'loading'
        })
        try {
            const resp = yield gql.mistakeTemplates()
            let template_id = ''
            if (resp.mistakeTemplates.length > 0) {
                template_id = resp.mistakeTemplates[0].id
            }
            this.setData({
                template: resp.mistakeTemplates,
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
            console.log(err)
        }
    }),

    //打印
    quickPrint: function (e) {
        let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
        if (hideConfirmPrintBox) {
            this.confirmPrint()
        } else {
            this.setData({
                ['confirmModal.isShow']: true
            })
        }
    },
    confirmPrint: co.wrap(function* (e) {
        let info
        this.longToast.toast({
            type: 'loading'
        })
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
        let link = []
        for (let i = 0; i < this.data.convert_urls.length; i++) {
            let urls = {}
            urls.originalUrl = this.data.convert_urls[i]
            urls.printUrl = this.data.convert_urls[i]
            urls.color = this.data.color == 'Color' ? true : false
            urls.copies = 1
            urls.grayscale = false
            link.push(urls)
        }
        if (this.data.answer_urls.length > 0 && this.data.answer == 1) {
            for (let i = 0; i < this.data.answer_urls.length; i++) {
                let urls = {}
                urls.originalUrl = this.data.answer_urls[i]
                urls.printUrl = this.data.answer_urls[i]
                urls.color = this.data.color == 'Color' ? true : false
                urls.number = 1
                urls.grayscale = false
                link.push(urls)
                console.log("1111111", link)
            }
        }
        this.longToast.toast({
            type: 'loading'
        })

        try {
            const resp = yield commonRequest.createOrder('mistake', link)
            return
            // const resp = yield request({
            //     url: app.apiServer + `/ec/v2/orders`,
            //     method: 'POST',
            //     dataType: 'json',
            //     data: params2
            // })
            // if (resp.data.code != 0) {
            //     throw (resp.data)
            // }
            // console.log('打印====', resp.data)
            // router.redirectTo('/pages/finish/index', {

            // })
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
        this.longToast.toast({
            type: 'loading'
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