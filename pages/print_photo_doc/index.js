//pages/print_photo_doc/choose.js
"use strict"
const app = getApp()
const logger = new Logger.getLogger('pages/index/index')
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')

const imgInit = require('../../utils/imgInit')  
const chooseImage = util.promisify(wx.chooseImage)
const showModal = util.promisify(wx.showModal)
const getNetworkType = util.promisify(wx.getNetworkType)
const chooseMessageFile = util.promisify(wx.chooseMessageFile)

import wxNav from '../../utils/nav.js'
import Logger from '../../utils/logger.js'
import commonRequest from '../../utils/common_request.js'
import { timingSafeEqual } from 'crypto';

const chooseCtx = {
    data: {
        showArea: false,
        showIndex: false,
        popWindow: false,
        showConsumablesModal: false, //耗材推荐弹窗
        consumablesIcon: false, //耗材推荐图标
        images: [],
        realCount: 0, //图片渲染前计数
        maxCount: 8, //最大数量限制
        uploadImg: false, //上传进度条显示、隐藏
        //图片选择器
        popWindow: false,
        


    },

    onload: function(){
        this.query = options || {}
        this.initUseArea()

    },

    //初始化当前区域信息
    initUseArea: function(){
        this.media_type = 'pic2doc'
        var isNoUse = wx.getStorageSync('picToDocUseStatus') || null
        if(isNoUse){
            this.setData({
                showArea: true,
                showIndex: false
            })
            this.initSingleArea()
            this.getStorageImages(this.media_type)
        } else {
            this.setData({
                showArea: true,
                mediumRecommend: this.media_type,
                showIndex: true
            })
            this.getSupplyBefore(this.media_type)
        }
    },

    //初始化视图区域信息
    initSingleArea: function(){
        try {
            let res = wx.getSystemInfoSync()
            let width = (res.windowWidth - 35) / 2
            let height = width / this.data.media_size[this.media_size].width * this.data.media_size[this.media_size].height
            this.setData({
                width,
                height
            })
        }
        catch (e){
            logger.error(e)
        }
    },

    getStorageImages: function(media_type){
        try {
            app.judgeClearStorage('2.1.3',media_type)
            let galleryImage = wx.getStorageSync(media) || {
                images: [],
                allCount: 0
            }
            if (galleryImage){
                this.setData({
                    images: galleryImage.images,
                    allCount: galleryImage.allCount
                })
            }
        } catch (e){
            logger.error('getStorageImage == 获取本地图片失败')
        }
    },

    getSupplyBefore (media_type){
        commonRequest.getSupplyBefore(media_type).then(
            res => {
                res.supply_types && this.setData({
                    supply_types: res.supply_types
                })
            }
        )
    },

    toUse: function(){
        var useStatus = 'picToDocUseStatus'
        wx.setStorageSync(useStatus, true)
        this.setData({
            showIndex: false
        })
        this.initSingleArea()
    },

    //删除照片
    deleteImg: co.wrap(function *({currentTarget: {id}}){
        let images = this.data.images
        let res = yield showModal({
            title: '确认删除',
            content: '确认删除照片？',
            confirmColor: '#ffe27a'
        })
        if(!res.confirm){
            return
        }
        let count = this.data.images[id].count
        images.splice(id, 1)
        this.setData({
            images: images,
            allCount: this.data.allCount - count
        })
        this.setStorage()
        console.log('删除后剩余照片:', this.data.images)
    }),

    hideToast: function(e){
        if(!this.querry.gallerySource || this.querry.gallerySource == 'localStorage'){
            return
        }
        // this.longToast.toast()
        this.longToast = new app.weToast()
        this.longToast.toast({
            type: "loading",
            duration: 3000
        })
        this.setData({
            realCount: 0
        })
    },

    errImage: function(e){
        if(this.querry.gallerySource){
            return
        }
        let images = this.data.images
        images.splice(images.length-1, 1)
        this.setData({
            images: this.data.images,
            allCount: this.data.allCount - 1
        })
        this.setStorage()
        logger.info('某张图片渲染失败后还可以继续上传的张数：', this.data.allCount)
        logger.info('某张图片渲染失败后还可以继续上传的张数：', this.data.countLimit)
    },

    previewImg: function({currentTarget: {id}}){
        let image = this.data.images[id]
        wx.previewImg({
            current: image.afterEditUrl || image.url,
            urls: [image.afterEditUrl || image.url]
        })
    },

    //编辑照片
    toMoreEdit: function({currentTarget: {id, flag = false}}){
        let image = this.data.images[id]
        let params = {
            url: image.localUrl,
            mode: 'quadrectangle',
            index: id,
            media_type: this.media_type,
            from: 'pic2doc',
            isSingle: !flag,
            // currentCount: Math.max(this.data.images.length - this.data.preAllCount, 0) //当前选择的图片总数
            currentCount: this.data.images.length - this.data.preAllCount
        }
        wxNav.navigateTo('/pages/print_photo_doc/edit')
    },

    //减张数
    decrease: function({currentTarget: {id}}){
        let images = this.data.images
        let item = this.data.images[id]
        if(item.count == 0){
            return wx.showModal({
                title: '提示',
                content: '请先选中该照片',
                showCancel: false,
                confirmColor: '#ffe27a'
            })
        }
        //最少一张
        if(item.count <= 1){
            return
        }
        this.setData({
            ['images[${id}].count']: --images[id].count,
            allCount: this.data.allCount - 1
        })
    },

    //增张数
    increase: function(){
        let images = this.data.images
        let item = this.data.images[id]
        if(item.count == 0){
            wx.showModal({
                title: '提示',
                content: '请先选中该照片',
                showCancel: false,
                confirmColor: '#ffe27a'
            })
        }
        this.setData({
            ['images[${id}].count']: ++images[id].count,
            allCount: this.data.allCount + 1
        })
    },

    openPopWindow: function(){
        if (this.data.images.length > this.data.maxCount){
            return wx.showModal({
                content: '已选照片达到限定数量，请重新选择上传',
                confirmText: '确认',
                showCancel: false
            })
        }
        if(this.data.uploadImg){
            return
        }
        this.setData({
            popWindow: true
        })
    },

    closePopWindow: function(){
        this.setData({
            popWindow: false
        })
    },

    chooseImg: co.wrap(function *(e){
        if(app.preventMoreTap(e)){
            return
        }

        let net = yield getNetworkType()
        if(net.networktype === "none"){
            return wx.showModal({
                content: '貌似断网了哦~',
                showCancel: false,
                confirmColor: '#ffe27a',
                confirmText: '确认'
            })
        }
        let res
        let that = this
        let countLimit = Math.max((that.data.maxCount - that.data.images.length), 0)
        let photoSource = e.currentTarget.id
        let sourceType = photoSource = 'takePhoto' ? ["camera"] : ["album"]

        if(['takePhoto', 'localAlbum'].indexOf(photoSource) > -1){
            res = yield chooseImage({
                count: countLimit,
                sizeType: ['original'],   
                sourceType: sourceType
            })
        } else {
            var SDKVersion
            try {
                const resInfo = wx.getSystemInfoSync()
                SDKVersion = resInfo.SDKVersion
            } catch (e){
                logger.info(e)
            }
            if(util.compareVersion(SDKVersion, '2.5.0')){
                res = yield chooseMessageFile({
                    type: 'image',
                    count: countLimit
                })
            } else {
                //请升级最新的微信版本
                yield showModal({

                })
            }
        }









    })












}

page(chooseCtx)
