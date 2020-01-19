"use strict"

const app = getApp()
import api from '../../../../network/restful_request.js'
import commonRequest from '../../../../utils/common_request'
const regeneratorRuntime = require('../../../../lib/co/runtime')
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import {
    co,
    util
} from '../../../../utils/common_import'
const _ = require('../../../../lib/underscore/we-underscore')
const getSystemInfo = util.promisify(wx.getSystemInfo)
const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const imginit = require('../../../../utils/imginit')
import router from '../../../../utils/nav'

Page({
    data: {
        // 本地照片地址
        localImgPath: '',
        showConfirmModal: null,
        // 本地照片信息
        imgInfo: null,
        // 照片编辑参数
        userImgPosition: {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0
        },
        // 编辑区域
        area: {
            width: 1300,
            height: 1590,
            x: 0,
            y: 0,
            areaWidth: 1300,
            areaHeight: 1590
        },
        // 编辑区域初始位置信息
        areaPosition: {
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            scale: 1
        },
        // 照片编辑动画传递
        animationData: {},
        // 是否显示编辑区域框
        showAreaBorder: false,
        // 是否显示换张试试
        showChangeBtn: false,
        changeBtnWidth: 90,
        share: app.share,
        image: '',
        gfdAlbumPic: '',
        localImage: '',
        popWindow: false,
        mode: '',
        realScale: 0,
        realRotate: 0,
        convertImg: null,
        print_count: 1, //打印份数
        hasAuthPhoneNum: false,
        confirmModal: {
            isShow: false,
            title: '请参照下图正确放置照片纸',
            image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
        }
    },
    onLoad: co.wrap(function* (query) {
        this.longToast = new app.weToast()
        this.image = JSON.parse(decodeURIComponent(query.image))
        logger.info(this.image, query)
        this.feature_key = query.feature_key
        this.setData({
            changeBtnWidth: parseInt(200 / app.rpxPixel), // 宽度计算
        })
        yield this.initArea() // 初始化编辑区域
        yield this.initDesign()
    }),
    onShow: function () {
        let hasAuthPhoneNum = Boolean(wx.getStorageSync('hasAuthPhoneNum'))
        this.hasAuthPhoneNum = hasAuthPhoneNum
        this.setData({
            hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
        })
    },
    // 初始化整体模板布局
    initArea: co.wrap(function* () {
        const res = yield getSystemInfo()
        let area = this.data.area
        area.width = this.image.areaWidth
        area.areaWidth = this.image.areaWidth
        area.height = this.image.areaHeight
        area.areaHeight = this.image.areaHeight
        this.setData({
            area: area
        })

        // 计算模板宽高位置
        const avaWidth = res.windowWidth
        // 可用高度=窗口高度-底部导航栏高度
        const avaHeight = res.windowHeight - 300 * (res.windowWidth / 750)

        let areaHeight, areaWidth
        let margin = avaWidth * 0.15
        let designAreaMaxWidth = avaWidth - 2 * margin
        let designAreaMaxHeight = avaHeight

        logger.info('相纸大小', this.data.area)

        let scale = this.data.area.width / this.data.area.height
        if (this.data.area.width <= this.data.area.height) {
            areaHeight = designAreaMaxHeight
            areaWidth = designAreaMaxHeight * scale
            // 修正
            if (areaWidth > designAreaMaxWidth) {
                areaHeight = areaHeight * (designAreaMaxWidth / areaWidth)
                areaWidth = designAreaMaxWidth
            }
        } else {
            areaWidth = designAreaMaxWidth
            areaHeight = designAreaMaxWidth / scale
            // 修正
            if (areaHeight > designAreaMaxHeight) {
                areaWidth = areaWidth * (designAreaMaxHeight / areaHeight)
                areaHeight = designAreaMaxHeight
            }
        }

        const areaPosition = {
            width: areaWidth,
            height: areaHeight,
            top: (designAreaMaxHeight - areaHeight) / 2 + margin,
            left: (designAreaMaxWidth - areaWidth) / 2 + margin,
            scale: areaWidth / this.data.area.width
        }

        logger.info('当前模板---areaPosition', areaPosition)

        this.setData({
            areaPosition: areaPosition
        })
    }),
    // 初始化编辑器
    initDesign: co.wrap(function* () {
        let width = this.image.imageWidth
        let height = this.image.imageHeight

        let imgInfo = {
            width: width,
            height: height
        }
        this.data.localImgPath = this.image.preview_url
        this.originalImgInfo = _.clone(imgInfo)
        if (height > 1300) {
            this.data.localImgPath = imginit.addProcess(this.data.localImgPath, '/resize,h_1300')
            this.editScale = imgInfo.height / 1300
            imgInfo.width = imgInfo.width / this.editScale
            imgInfo.height = imgInfo.height / this.editScale
        }

        this.setData({
            localImgPath: this.data.localImgPath,
            imgInfo: imgInfo
        })
        // 显示、实际缩放比
        this.editorScale = this.data.areaPosition.width / this.data.area.width

        // 初始化位置
        let sv
        let imgX
        let imgY
        sv = util._getSuiteValues(
            this.data.imgInfo.width,
            this.data.imgInfo.height,
            this.data.area.areaWidth * this.editorScale,
            this.data.area.areaHeight * this.editorScale
        )

        imgX = this.data.area.x * this.editorScale + sv.left - (this.data.imgInfo.width - sv.width) / 2
        imgY = this.data.area.y * this.editorScale + sv.top - (this.data.imgInfo.height - sv.height) / 2

        let imgScale = sv.scale.toFixed(3)
        let imgRotate = 0

        this.moveX = imgX
        this.moveY = imgY
        this.scale = imgScale
        this.rotate = imgRotate
        this.twoPoint = false
        this.currentPoint = 0

        const userImgPosition = {
            x: imgX,
            y: imgY,
            scale: imgScale,
            rotate: imgRotate,
        }

        this.setData({
            userImgPosition: userImgPosition,
            realScale: imgScale,
            realRotate: imgRotate
        })
    }),
    getResult: co.wrap(function* () {
        return {
            x: parseInt(this.data.userImgPosition.x),
            y: parseInt(this.data.userImgPosition.y),
            scale: parseFloat(this.data.userImgPosition.scale),
            rotate: parseInt(this.data.userImgPosition.rotate),
        }
    }),
    increase() {
        if (this.data.print_count >= 50) {
            return wx.showModal({
                title: '最多打印50份',
                showCancel: false,
                confirmColor: '#fae100'
            })
        }
        this.setData({
            print_count: ++this.data.print_count
        })
    },
    decrease() {
        if (this.data.print_count <= 1) {
            return wx.showModal({
                title: '最少打印1份',
                showCancel: false,
                confirmColor: '#fae100'
            })
        }
        this.setData({
            print_count: --this.data.print_count
        })
    },
    // 合成图片
    editConvert: co.wrap(function* (e) {

        // if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
        //     return
        // }

        this.longToast.toast({
            type: 'loading',
            duration: 0
        })
        let imageURL = this.image.url

        // canvas绘图
        const result = yield this.getResult()
        // 旋转修正0-360
        let rotate = result.rotate

        if (rotate < 0) {
            rotate = rotate + 360
        }

        // 坐标系修正
        let mp
        if (rotate == 0 || rotate == 180) {
            mp = 0
        } else if (rotate <= 90) {
            mp = Math.PI / (180 / rotate)
        } else if (rotate > 90 && rotate < 180) {
            mp = Math.PI / (180 / (180 - rotate))
        } else if (rotate > 180 && rotate < 270) {
            mp = Math.PI / (180 / (rotate - 180))
        } else if (rotate >= 270 && rotate <= 360) {
            mp = Math.PI / (180 / (360 - rotate))
        }

        // 旋转纠偏
        let svw = (this.data.imgInfo.width - result.scale * (this.data.imgInfo.width * Math.cos(mp) + this.data.imgInfo.height * Math.sin(mp))) / 2

        let svh = (this.data.imgInfo.height - result.scale * (this.data.imgInfo.width * Math.sin(mp) + this.data.imgInfo.height * Math.cos(mp))) / 2

        let params = {
            is_async: false, //一异步请求
            feature_key: this.feature_key, 
            editor_scale: this.editorScale,
            image_width: this.data.imgInfo.width,
            image_height: this.data.imgInfo.height,
            image_url: imageURL,
            rotate: rotate,
            scale: result.scale,
            x: result.x + svw,
            y: result.y + svh
        }


        app.tmpIDParams = params
        try {
             const resp = yield api.convertId(params)
            this.longToast.hide()
            logger.info(resp)
            if (resp.code != 0) {
                throw (resp)
            } else {
                this.setData({
                    convertImg: {
                        pre_convert_url: resp.res.url,
                        url: resp.res.url + this.image.print_size.noRotateMin
                    }
                })
                this.confirm(e)
            }
        } catch (e) {
            console.error(e)
            this.longToast.toast()
            yield showModal({
                title: '提交失败',
                content: '请检查您的网络，请稍候重试',
                showCancel: false,
                confirmColor: '#fae100'
            })
            return null
        }
    }),
    // 确认打印
    confirm: co.wrap(function* (e) {
        if (app.preventMoreTap(e)) {
            return
        }

        let hideConfirmPrintBox = Boolean(wx.getStorageSync("hideConfirmPrintBox"))
        if (hideConfirmPrintBox) {
            this.print()
        } else {
            let imgSrc = `https://cdn.gongfudou.com/miniapp/ec/confirm_print${this.image.media_type == '_a4' ? '_a4_new' : ''}.png`
            this.setData({
                ['confirmModal.isShow']: true,
                ['confirmModal.image']: imgSrc
            })
        }
    }),
    getPhoneNumber: co.wrap(function* (e) {
        // yield app.getPhoneNum(e)
        // wx.setStorageSync("hasAuthPhoneNum", true)
        // this.hasAuthPhoneNum = true
        // this.setData({
        //     hasAuthPhoneNum: true
        // })
        this.editConvert(e)
    }),

    // 开始打印
    print: co.wrap(function* (e) {
        var param = {
            originalUrl: this.image.url, //  用户上传的原文件
            printUrl: this.data.convertImg.pre_convert_url || '', // 编辑后可打印的连接
            copies: this.data.print_count, // 打印份数
            grayscale: false, // 是否使用灰度打印
            color:true
        }
        // if (!this.checkImagesIsValid(images)) return;
        this.longToast.toast({
            type: 'loading',
            duration: 0
        })
    
        try {
            const resp = yield commonRequest.createOrder(this.feature_key, param)
            this.longToast.hide()
            logger.info(resp)
            router.redirectTo('/pages/finish/index', {
                media_type:'shareFile',
                state: resp.createOrder.state
              })
        } catch (e) {
            this.longToast.toast()
            util.showError(e)
        }
    }),
    loopGetOpenId: co.wrap(function* () {
        let loopCount = 0
        let _this = this
        if (!app.openId) {
            setTimeout(function () {
                loopCount++
                if (loopCount <= 100) {
                    logger.info('openId not found loop getting...')
                    _this.loopGetOpenId()
                } else {
                    logger.info('loop too long, stop')
                }
            }, 2000)
        }
    }),
    checkImagesIsValid(images) {
        for (var i = 0; i < images.length; i++) {
            if (images[i].url == '' || images[i].url == undefined) {
                wx.showModal({
                    title: '提示',
                    content: `第${i + 1}张图片暂时无法打印，请删除后重新上传打印`,
                    showCancel: false,
                    confirmColor: '#FFE27A'
                })
                return false
            }
        }
        return true
    },
    onTouch: function (e) {
        this.lastMoveX = 0
        this.lastMoveY = 0

        if (e.touches.length == 2) {
            // 双指操作
            this.twoPoint = true
            let xLen = Math.abs(e.touches[1].pageX - e.touches[0].pageX)
            let yLen = Math.abs(e.touches[1].pageY - e.touches[0].pageY)

            this.touchDistance = util._getDistance(xLen, yLen)
            this.touchVector = {
                x: e.touches[1].pageX - e.touches[0].pageX,
                y: e.touches[1].pageY - e.touches[0].pageY
            }
        } else {
            // 单指操作
            this.twoPoint = false
            this.touchX = e.touches[0].pageX
            this.touchY = e.touches[0].pageY
        }
    },
    onTouchMove: function (e) {
        // 显示编辑区域边框
        this.setData({
            showAreaBorder: true,
            showChangeBtn: false
        })
        try {
            if (this.twoPoint === true) {
                // 缩放
                let xMove = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
                let yMove = Math.abs(e.touches[0].pageY - e.touches[1].pageY);

                let changedDistance = util._getDistance(xMove, yMove);

                let scale = (this.data.userImgPosition.scale * changedDistance / this.touchDistance).toFixed(3)

                // 缩放最大边4096
                if (scale * this.data.imgInfo.width / this.editorScale <= 4000 && scale * this.data.imgInfo.height / this.editorScale <= 4000) {
                    this.scale = scale
                }

                // 旋转
                this.changedVector = {
                    x: e.touches[1].pageX - e.touches[0].pageX,
                    y: e.touches[1].pageY - e.touches[0].pageY
                }

                let angel = util._getRotateAngle(this.changedVector, this.touchVector);

                this.rotate = util._snapToAngle(this.data.userImgPosition.rotate + angel, 90, 5);


                this.setData({
                    realScale: this.scale,
                    realRotate: this.rotate
                })
            } else {
                // 移动
                this.moveX = this.data.userImgPosition.x + e.touches[0].pageX - this.touchX - this.lastMoveX
                this.moveY = this.data.userImgPosition.y + e.touches[0].pageY - this.touchY - this.lastMoveY

                this.lastMoveX = e.touches[0].pageX - this.touchX
                this.lastMoveY = e.touches[0].pageY - this.touchY

                this.setData({
                    userImgPosition: {
                        x: this.moveX,
                        y: this.moveY,
                        scale: this.scale,
                        rotate: this.rotate
                    },
                })
            }
        } catch (e) {
            logger.info(e)
        }

    },
    onTouchEnd: function () {
        this.setData({
            showAreaBorder: false,
            userImgPosition: {
                x: this.moveX,
                y: this.moveY,
                scale: this.scale,
                rotate: this.rotate
            }
        })
    },
    onShareAppMessage() {
        return app.share
    }
})