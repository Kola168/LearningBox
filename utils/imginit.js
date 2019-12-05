"use strict"
const regeneratorRuntime = require('../lib/co/runtime')
const co = require('../lib/co/co')
const util = require('../utils/util')
const _ = require('../lib/underscore/we-underscore')

const getImageInfo = util.promisify(wx.getImageInfo)
const showModal = util.promisify(wx.showModal)


//原图合成打印图片resize参数
const mediaResizeData={
    '_6inch':'/resize,m_fill,h_1950,w_1300,limit_0/quality,Q_100/format,jpg',
    '_5inch':'/resize,m_fill,h_1560,w_1092,limit_0/quality,Q_95/format,jpg',
    '_a4':'/resize,m_fill,h_3564,w_2520,limit_0/quality,Q_95/format,jpg',
    '_7inch':'/resize,m_fill,h_2184,w_1560,limit_0/quality,Q_95/format,jpg',
    'pic2doc':'/resize,m_pad,h_3564,w_2520,limit_0/quality,Q_95/format,jpg',
    'mini_album':'/resize,m_fill,h_620,w_465,limit_0/quality,Q_85/format,jpg',
    'lomo':'/resize,m_fill,h_1240,w_874,limit_0/quality,Q_95/format,jpg',
    'ai_scan':'/resize,m_lfit,h_3564,w_2520,limit_0/quality,Q_95/format,jpg',
    'copy':'/resize,h_3564,w_2520,limit_0/quality,Q_95/format,jpg',
    'course_photo':'/resize,h_3564,w_2520,limit_0/quality,Q_95/format,jpg',
}

var mediaResize=function(url,mediaType){
    return addProcess(url,mediaResizeData[mediaType])
}



// 图片初始化处理
// direction invariant 保持不变  vertical 纵向  transverse 横向
var imgInit = co.wrap(function*(imgPath, deflecting) {
    console.log(imgPath)

    let direction = 'invariant'
    if (deflecting) {
        direction = deflecting
    }

    try {
        let imgNetPath= imgPath
        let imageInfo
        try {
            imageInfo = yield getImageInfo({
                src: imgNetPath
            })
        } catch (e) {
            console.log('获取图片信息失败，再次获取11111', e)   //莫名其妙有几率getImageInfo失效
            imageInfo = yield getImageInfo({
                src: imgNetPath
            })
        }

        console.log('imageInfo====', imageInfo)
        if (imageInfo.width > 4000 || imageInfo.height > 4000) {
            imgNetPath = addProcess(imgNetPath, '/resize,w_2000,h_2000')
            if (imageInfo.width > imageInfo.height) {
                imageInfo.height = 2000 * imageInfo.height / imageInfo.width
                imageInfo.width = 2000
            } else {
                imageInfo.width = 2000 * imageInfo.width / imageInfo.height
                imageInfo.height = 2000
            }
        }
        imgNetPath =addProcess(imgNetPath, '/auto-orient,1')
        if (imageInfo.orientation == 'left' || imageInfo.orientation == 'left-mirrored' || imageInfo.orientation == 'right' || imageInfo.orientation == 'right-mirrored') {
            let newHeight = imageInfo.height
            imageInfo.height = imageInfo.width
            imageInfo.width = newHeight
        }
        console.log('imageInfo222222222222', imageInfo, imgNetPath)
        //vertical 纵向 transverse 横向
        if ((direction == 'vertical' && (imageInfo.width > imageInfo.height)) || (direction == 'transverse' && (imageInfo.width < imageInfo.height))) {
            imgNetPath = addProcess(imgNetPath, '/rotate,90')
            let newHeight = imageInfo.height
            imageInfo.height = imageInfo.width
            imageInfo.width = newHeight
        }
        return { imgNetPath: imgNetPath, imageInfo: imageInfo}
    } catch (e) {
        console.log(e)
        yield showModal({
            title: '错误信息',
            content: '图片上传失败',
            showCancel: false,
            confirmColor: '#fae100'
        })
        return null
    }
})

function addProcess(imgUrl, process) {
    if (!process) {
        process = ''
    }
    if (imgUrl.indexOf('?x-image-process=image') < 0) {
        imgUrl += '?x-image-process=image'
    }

    if (process.indexOf('/resize') >= 0) {
        process += '/marker,u_plus'
    }
    imgUrl +=process
    return imgUrl
}

module.exports = {
    imgInit: imgInit,
    addProcess:addProcess,
    mediaResize:mediaResize
}
