"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
import {
    co,
    util
  } from '../../../../utils/common_import'
import config from './config'
import router from '../../../../utils/nav'
Page({
    data: {
        url: null,
        width: 0,
        height: 0,
        img_src: null,
        imgInfo: null,
        media_type: '_6inch', // 当前默认尺寸值
        print_size: null, //提交打印尺寸信息
        media_size: {}
    },
    onLoad: co.wrap(function* (query) {
        this.initDisplayArea()
        const image = JSON.parse(decodeURIComponent(query.image))
        const imgInfo = yield this.computeImgSize(image, this.data.width, this.data.height);
        const media_size = util.isHuaweiCloud(image.url) ? config.huaweiCloud : config.aliCloud
        this.setData({
            media_size: media_size,
            img_src: image.url,
            imgInfo,
            image, //原始图片信息保留
            print_size: media_size[this.data.media_type]
        })
        try{
            this.feature_key= media_size[this.data.media_type].key
        }catch(e)
    {
       console.log(e) 
    }
       
    }),
    initDisplayArea() {
        try {
            let res = wx.getSystemInfoSync()
            let width = res.windowWidth - 114,
                height = width * 1.50

            this.setData({
                width: width,
                height: height
            })
        } catch (e) {
            console.log(e)
        }
    },
    /**
     * @methods 计算图片尺寸
     * @Params {src ,maxwidth, maxheight}
     */
    computeImgSize: co.wrap(function* (image, maxwidth, maxheight) {
        let imgWidth = image.width,
            imgHeight = image.height
        if (imgWidth / imgHeight > maxwidth / maxheight) {
            imgHeight = imgHeight * maxwidth / imgWidth
            imgWidth = maxwidth
        } else {
            imgWidth = imgWidth * maxheight / imgHeight
            imgHeight = maxheight
        }
        return {
            imgWidth,
            imgHeight
        }
    }),
    toPrintEdit() {
        const {
            image,
            media_type,
            media_size
        } = this.data;
        const query = {
            media_type: media_type,
            areaWidth: media_size[media_type].width,
            areaHeight: media_size[media_type].height,
            print_size: media_size[media_type],
            url: image.origin_url,
            preview_url: image.url,
            imageWidth: image.width,
            imageHeight: image.height
        };
        var path = util.isHuaweiCloud(image.url) ? 'more_edit' : 'more_edit_ali'
        router.navigateTo(`/pages/package_feature/share_folder/${path}/index`,{
            image:encodeURIComponent(JSON.stringify(query)),
            feature_key: this.feature_key
        })
    },
    /**
     * @methods 选择图片尺寸
     */
    chooseImageSize() {
        const mediaTypeList = Object.keys(this.data.media_size)
        const itemList = mediaTypeList.map(item => this.data.media_size[item].name)
        wx.showActionSheet({
            itemList: itemList,
            success: (res) => {
                this.setData({
                    media_type: mediaTypeList[res.tapIndex],
                    print_size: this.data.media_size[mediaTypeList[res.tapIndex]]
                })
            },
            fail: (res) => {
                console.log(res.errMsg)
            }
        })
    },
    onShareAppMessage() {
        return app.share;
    }
})