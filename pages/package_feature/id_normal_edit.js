// "use strict"

// const app = getApp()
// const regeneratorRuntime = require('../../lib/co/runtime')
// const co = require('../../lib/co/co')
// const util = require('../../utils/util')
//     // const _ = require('../../lib/underscore/we-underscore')
//     // const uploadFormId = require('../../utils/gfd-formid-upload')

// const chooseImage = util.promisify(wx.chooseImage)
// const getImageInfo = util.promisify(wx.getImageInfo)
// const getSystemInfo = util.promisify(wx.getSystemInfo)
// const uploadFile = util.promisify(wx.uploadFile)
// const request = util.promisify(wx.request)
// const showModal = util.promisify(wx.showModal)
// const getStorage = util.promisify(wx.getStorage)
// const setStorage = util.promisify(wx.setStorage)
// const canvasToTempFilePath = util.promisify(wx.canvasToTempFilePath)
// const downloadFile = util.promisify(wx.downloadFile)
// const chooseMessageFile = util.promisify(wx.chooseMessageFile)


// Page({
//     data: {
//         // 本地照片地址
//         localImgPath: '',
//         // 本地照片信息
//         imgInfo: null,
//         // 照片编辑参数
//         userImgPosition: {
//             x: 0,
//             y: 0,
//             scale: 1,
//             rotate: 0
//         },
//         // 编辑区域
//         area: {
//             url: '../../images/id-templete.png',
//             width: 480,
//             height: 670,
//             x: 0,
//             y: 0,
//             areaWidth: 480,
//             areaHeight: 670
//         },
//         // 编辑区域初始位置信息
//         areaPosition: {
//             width: 0,
//             height: 0,
//             top: 0,
//             left: 0,
//             scale: 1
//         },
//         // 照片编辑动画传递
//         animationData: {},
//         // 是否显示编辑区域框
//         showAreaBorder: false,
//         // 是否显示换张试试
//         showChangeBtn: false,
//         changeBtnWidth: 90,
//         share: app.share,
//         image: '',
//         // isGfdAlbum: false,
//         gfdAlbumPic: '',
//         localImage: '',
//         popWindow: false,
//         mode: '_id1in',
//         source: '',
//         realScale: 0,
//         realRotate: 0
//     },

//     // 分享事件
//     onShareAppMessage: function() {
//         return app.share
//     },

//     onLoad: co.wrap(function*(query) {
//         this.longToast = new app.WeToast()
//             // 宽度计算
//         this.setData({
//             changeBtnWidth: parseInt(200 / app.rpxPixel)
//         })

//         if (query.media_type) {
//             this.changeSize(query.media_type)
//             this.media_type = query.media_type
//         }
//         // 初始化编辑区域
//         yield this.initArea()
//     }),
//     //删除照片
//     deleteImg: co.wrap(function*() {
//         let del = yield showModal({
//             title: '确认删除',
//             content: '确定删除这张照片吗',
//             confirmColor: '#2086ee'
//         })
//         if (!del.confirm) {
//             return
//         }
//         this.setData({
//             localImgPath: ''
//         })
//     }),
//     changeSize: co.wrap(function*(mode) {
//         let area = this.data.area
//         let name = '1寸证件照'
//         switch (mode) {
//             case '_id1in':
//                 area.areaWidth = 480
//                 area.areaHeight = 670
//                 area.width = 480
//                 area.height = 670
//                 name = '1寸证件照'
//                 break
//             case '_id2in':
//                 area.areaWidth = 585
//                 area.areaHeight = 816 //大二寸883
//                 area.width = 585
//                 area.height = 816
//                 name = '2寸证件照'
//                 break
//             case '_id1ins':
//                 area.areaWidth = 286
//                 area.areaHeight = 416
//                 area.width = 286
//                 area.height = 416
//                 name = '小1寸证件照'
//                 break
//             case '_id1inb':
//                 area.areaWidth = 429
//                 area.areaHeight = 624
//                 area.width = 419
//                 area.height = 624
//                 name = '大1寸证件照'
//                 break
//             case '_id2ins':
//                 area.areaWidth = 455
//                 area.areaHeight = 585
//                 area.width = 455
//                 area.height = 585
//                 name = '小2寸证件照'
//                 break
//             case '_id2inb':
//                 area.areaWidth = 455
//                 area.areaHeight = 689
//                 area.width = 455
//                 area.height = 689
//                 name = '大2寸证件照'
//                 break
//             case '_id3in':
//                 area.areaWidth = 715
//                 area.areaHeight = 1092
//                 area.width = 715
//                 area.height = 1092
//                 name = '3寸证件照'
//                 break
//             case '_visa_usa':
//                 area.areaWidth = 663
//                 area.areaHeight = 663
//                 area.width = 663
//                 area.height = 663
//                 name = '美国签证'
//                 break
//             case '_visa_jp':
//                 area.areaWidth = 585
//                 area.areaHeight = 585
//                 area.width = 585
//                 area.height = 585
//                 name = '日本签证'
//                 break
//             case '_visa_kor':
//                 area.areaWidth = 455
//                 area.areaHeight = 585
//                 area.width = 455
//                 area.height = 585
//                 name = '韩国签证'
//                 break
//             case '_visa_tha':
//                 area.areaWidth = 455
//                 area.areaHeight = 585
//                 area.width = 455
//                 area.height = 585
//                 name = '泰国签证'
//                 break
//                 // case '_id3in':
//                 //     area.areaWidth = 714
//                 //     area.areaHeight = 1057
//                 //     area.width = 714
//                 //     area.height = 1057
//                 //     name = '美国护照'
//                 //     break
//                 // case '_id4in':
//                 //     area.areaWidth = 714
//                 //     area.areaHeight = 1057
//                 //     area.width = 714
//                 //     area.height = 1057
//                 //     name = '日本护照'
//                 //     break
//         }
//         // 设置title
//         wx.setNavigationBarTitle({
//             title: name
//         })
//         if (area.areaWidth == area.areaHeight) {
//             area.url = '../../images/id-templete-square.png'
//         }

//         this.setData({
//             area: area,
//             mode: mode
//         })
//     }),
//     showChange: co.wrap(function*() {
//         if (this.data.showChangeBtn) {
//             this.setData({
//                 showChangeBtn: false
//             })
//         } else {
//             this.setData({
//                 showChangeBtn: true
//             })
//         }
//     }),

//     hideChange: co.wrap(function*() {
//         this.setData({
//             showChangeBtn: false
//         })
//     }),

//     changeImage: co.wrap(function*() {
//         this.setData({
//             popWindow: true,
//             // isGfdAlbum: false
//         })
//     }),
//     takePhoto: co.wrap(function*() {
//         const image = yield chooseImage({
//             count: 1,
//             sizeType: ['original'],
//             sourceType: ['camera']
//         })
//         console.log(`chooseImage ${image.tempFilePaths[0]}`)
//         this.path = image.tempFilePaths[0]
//         this.setData({
//             showChangeBtn: false,
//             popWindow: false,
//         })
//         try {
//             const imgInfo = yield getImageInfo({
//                 src: this.path
//             })
//             this.setData({
//                 imgInfo: imgInfo,
//                 localImgPath: this.path
//             })
//             console.log("imgInfo", imgInfo)
//         } catch (err) {
//             console.error(err)
//             wx.showModal({
//                 title: '照片加载失败',
//                 content: '请重新选择重试',
//                 showCancel: false,
//                 confirmColor: '#2086ee',
//                 success: function() {
//                     wx.navigateBack()
//                 }
//             })
//         }
//     }),

//     localAlbum: co.wrap(function*() {
//         const image = yield chooseImage({
//             count: 1,
//             sizeType: ['original'],
//             sourceType: ['album']
//         })
//         console.log(`chooseImage ${image.tempFilePaths}`)
//         this.path = image.tempFilePaths[0]
//         this.setData({
//             showChangeBtn: false,
//             popWindow: false,
//         })
//         try {
//             // 初始化编辑区域
//             const imgInfo = yield getImageInfo({
//                 src: this.path
//             })
//             this.setData({
//                 imgInfo: imgInfo,
//                 localImgPath: this.path
//             })
//         } catch (err) {
//             console.error(err)
//             wx.showModal({
//                 title: '照片加载失败',
//                 content: '请重新选择重试',
//                 showCancel: false,
//                 confirmColor: '#2086ee',
//                 success: function() {
//                     wx.navigateBack()
//                 }
//             })
//         }

//     }),
//     gfdAlbum: co.wrap(function*() {
//         console.log('here=======')
//         this.setData({
//             popWindow: false,
//         })
//         wx.redirectTo({
//             url: `/pages/albumlist/index?type=${'single'}`
//         })
//     }),

//     //从微信聊天记录中选择文件
//     weChatAlbum: co.wrap(function*() {
//         var SDKVersion
//         try {
//             const resInfo = wx.getSystemInfoSync()
//             console.log('基础库版本======', resInfo.SDKVersion)
//             SDKVersion = resInfo.SDKVersion
//         } catch (e) {
//             console.log(e)
//         }
//         if (util.compareVersion(SDKVersion, '2.5.0')) {
//             console.log('证件照执行到选择图片')
//             const image = yield chooseMessageFile({
//                 type: 'image',
//                 count: 1,
//             })

//             console.log(`chooseImage ${image.tempFiles}`)
//             this.path = image.tempFiles[0].path
//             console.log('image,this.path', image)

//             this.setData({
//                 showChangeBtn: false,
//                 popWindow: false,
//             })
//             try {
//                 const imgInfo = yield getImageInfo({
//                     src: this.path
//                 })
//                 this.setData({
//                     imgInfo: imgInfo,
//                     localImgPath: this.path
//                 })
//                 console.log("imgInfo", imgInfo)
//             } catch (err) {
//                 console.error(err)
//                 wx.showModal({
//                     title: '照片加载失败',
//                     content: '请重新选择重试',
//                     showCancel: false,
//                     confirmColor: '#2086ee',
//                     success: function() {
//                         wx.navigateBack()
//                     }
//                 })
//             }
//         } else {
//             //请升级到最新的微信版本
//             yield showModal({
//                 title: '微信版本过低',
//                 content: '请升级到最新的微信版本',
//                 confirmColor: '#2086ee',
//                 confirmText: "确认",
//                 showCancel: false
//             })
//         }
//     }),


//     closePopWindow: co.wrap(function*() {
//         this.setData({
//             popWindow: false
//         })
//     }),

//     imageLoadError: co.wrap(function*() {
//         // wx.showModal({
//         //     title: '照片加载失败',
//         //     content: '请重新选择',
//         //     showCancel: false,
//         //     confirmColor: '#2086ee',
//         //     success: function() {
//         //         wx.navigateBack()
//         //     }
//         // })
//     }),

//     // 初始化整体模板布局
//     initArea: co.wrap(function*() {
//         const res = yield getSystemInfo()
//             // 计算模板宽高位置
//         const avaWidth = res.windowWidth
//             // 可用高度=窗口高度-底部导航栏高度
//         const avaHeight = res.windowHeight - (100 + 80) * (res.windowWidth / 750)

//         let areaHeight, areaWidth
//         let margin = avaWidth * 0.1
//         let designAreaMaxWidth = avaWidth - 2 * margin
//         let designAreaMaxHeight = avaHeight - 2 * margin

//         console.log('相纸大小', this.data.area)

//         let scale = this.data.area.width / this.data.area.height
//         if (this.data.area.width <= this.data.area.height) {
//             areaHeight = designAreaMaxHeight
//             areaWidth = designAreaMaxHeight * scale
//                 // 修正
//             if (areaWidth > designAreaMaxWidth) {
//                 areaHeight = areaHeight * (designAreaMaxWidth / areaWidth)
//                 areaWidth = designAreaMaxWidth
//             }
//         } else {
//             areaWidth = designAreaMaxWidth
//             areaHeight = designAreaMaxWidth / scale
//                 // 修正
//             if (areaHeight > designAreaMaxHeight) {
//                 areaWidth = areaWidth * (designAreaMaxHeight / areaHeight)
//                 areaHeight = designAreaMaxHeight
//             }
//         }

//         const areaPosition = {
//             width: areaWidth,
//             height: areaHeight,
//             top: (designAreaMaxHeight - areaHeight) / 2 + margin + 80 * (res.windowWidth / 750),
//             left: (designAreaMaxWidth - areaWidth) / 2 + margin,
//             scale: areaWidth / this.data.area.width
//         }

//         console.log('areaPosition', areaPosition)

//         this.setData({
//             areaPosition: areaPosition
//         })
//     }),

//     // 初始化编辑器
//     initDesign: co.wrap(function*(e) {

//         if (this.data.source == 'computer') {
//             this.longToast.toast()
//         }

//         if (e != undefined) {
//             console.log(e.detail)

//             // 获取图片信息bug，这里通过load重新获取长宽信息
//             if (this.data.imgInfo.width != e.detail.width) {
//                 this.setData({
//                     imgInfo: {
//                         width: e.detail.width,
//                         height: e.detail.height
//                     }
//                 })
//             }
//         }

//         // 显示、实际缩放比
//         this.editorScale = this.data.areaPosition.width / this.data.area.width

//         // 初始化位置
//         let sv
//         let imgX
//         let imgY
//         sv = util._getSuiteValues(
//             this.data.imgInfo.width,
//             this.data.imgInfo.height,
//             this.data.area.areaWidth * this.editorScale,
//             this.data.area.areaHeight * this.editorScale
//         )

//         imgX = this.data.area.x * this.editorScale + sv.left - (this.data.imgInfo.width - sv.width) / 2
//         imgY = this.data.area.y * this.editorScale + sv.top - (this.data.imgInfo.height - sv.height) / 2

//         let imgScale = sv.scale.toFixed(3)
//         let imgRotate = 0

//         this.moveX = imgX
//         this.moveY = imgY
//         this.scale = imgScale
//         this.rotate = imgRotate
//         this.twoPoint = false
//         this.currentPoint = 0
//         this.animation = wx.createAnimation({
//             duration: 0,
//             delay: 0,
//             timingFunction: 'step-start',
//             transformOrigin: '50% 50% 0'
//         })

//         // this.animation
//         //   .translate3d(0, 0, 0)
//         //   .scale3d(imgScale, imgScale, 1)
//         //   .rotate(imgRotate).step()

//         const userImgPosition = {
//             x: imgX,
//             y: imgY,
//             scale: imgScale,
//             rotate: imgRotate,
//         }

//         this.setData({
//             // animationData: this.animation.export(),
//             userImgPosition: userImgPosition,
//             realScale: imgScale,
//             realRotate: imgRotate
//         })
//         console.log('initDesign', userImgPosition)
//     }),

//     onTouch: function(e) {
//         this.lastMoveX = 0
//         this.lastMoveY = 0

//         if (e.touches.length == 2) {
//             // 双指操作
//             this.twoPoint = true
//             let xLen = Math.abs(e.touches[1].pageX - e.touches[0].pageX)
//             let yLen = Math.abs(e.touches[1].pageY - e.touches[0].pageY)

//             this.touchDistance = util._getDistance(xLen, yLen)
//             this.touchVector = {
//                 x: e.touches[1].pageX - e.touches[0].pageX,
//                 y: e.touches[1].pageY - e.touches[0].pageY
//             }
//         } else {
//             // 单指操作
//             this.twoPoint = false
//             this.touchX = e.touches[0].pageX
//             this.touchY = e.touches[0].pageY
//         }
//     },

//     onTouchMove: function(e) {
//         // 显示编辑区域边框
//         this.setData({
//             showAreaBorder: true,
//             showChangeBtn: false
//         })
//         try {
//             if (this.twoPoint === true) {
//                 // 缩放
//                 let xMove = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
//                 let yMove = Math.abs(e.touches[0].pageY - e.touches[1].pageY);

//                 let changedDistance = util._getDistance(xMove, yMove);

//                 let scale = (this.data.userImgPosition.scale * changedDistance / this.touchDistance).toFixed(3)

//                 // 缩放最大边4096
//                 if (scale * this.data.imgInfo.width / this.editorScale <= 4000 && scale * this.data.imgInfo.height / this.editorScale <= 4000) {
//                     this.scale = scale
//                 }

//                 // 旋转
//                 this.changedVector = {
//                     x: e.touches[1].pageX - e.touches[0].pageX,
//                     y: e.touches[1].pageY - e.touches[0].pageY
//                 }

//                 let angel = util._getRotateAngle(this.changedVector, this.touchVector);

//                 this.rotate = util._snapToAngle(this.data.userImgPosition.rotate + angel, 90, 5);

//                 // this.animation.translate3d(0, 0, 0).scale3d(this.scale, this.scale, 1).rotate(this.rotate).step()

//                 this.setData({
//                     // animationData: this.animation.export(),
//                     realScale: this.scale,
//                     realRotate: this.rotate
//                 })
//             } else {
//                 // 移动
//                 this.moveX = this.data.userImgPosition.x + e.touches[0].pageX - this.touchX - this.lastMoveX
//                 this.moveY = this.data.userImgPosition.y + e.touches[0].pageY - this.touchY - this.lastMoveY

//                 this.lastMoveX = e.touches[0].pageX - this.touchX
//                 this.lastMoveY = e.touches[0].pageY - this.touchY

//                 this.setData({
//                     userImgPosition: {
//                         x: this.moveX,
//                         y: this.moveY,
//                         scale: this.scale,
//                         rotate: this.rotate
//                     },
//                 })
//             }
//         } catch (e) {
//             console.log(e)
//         }

//     },

//     onTouchEnd: function() {
//         this.setData({
//             showAreaBorder: false,
//             userImgPosition: {
//                 x: this.moveX,
//                 y: this.moveY,
//                 scale: this.scale,
//                 rotate: this.rotate
//             }
//         })
//     },

//     getResult: co.wrap(function*() {
//         return {
//             x: parseInt(this.data.userImgPosition.x),
//             y: parseInt(this.data.userImgPosition.y),
//             scale: parseFloat(this.data.userImgPosition.scale),
//             rotate: parseInt(this.data.userImgPosition.rotate),
//         }
//     }),

//     // 下一步
//     next: co.wrap(function*(e) {
//         if (!app.openId) {
//             yield this.loopGetOpenId()
//         }
//         if (!this.data.localImgPath) {
//             return yield showModal({
//                 title: '提示',
//                 content: '还没有选择照片哦',
//                 showCancel: false,
//                 confirmColor: '#2086ee'
//             })
//         }
//         this.longToast.toast({
//                 img: '/images/loading.gif',
//                 title: '正在提交',
//                 duration: 0
//             })
//             // console.log('form发生了submit事件，携带数据为：', e.detail)
//             // uploadFormId.dealFormIds(e.detail.formId, 'id-index')
//         let imageURL
//         try {
//             // if (this.data.isGfdAlbum) {
//             //     let downloadImage = yield downloadFile({ url: this.data.localImgPath })
//             //     console.log('downloadImage====', downloadImage.tempFilePath)
//             //     imageURL = yield app.uploadImage(downloadImage.tempFilePath)
//             // } else
//             // {
//             if (this.data.source == 'computer') {
//                 imageURL = this.data.localImgPath
//             } else {
//                 imageURL = yield app.newUploadImage(this.data.localImgPath)
//             }

//             // }
//         } catch (e) {
//             console.error(e)
//             this.longToast.toast()
//             yield showModal({
//                 title: '照片上传失败',
//                 content: '请检查网络或稍候再试',
//                 showCancel: false,
//                 confirmColor: '#2086ee'
//             })
//             return null
//         }



//         // canvas绘图
//         const result = yield this.getResult()
//         console.log("getResult", result, this.editorScale)

//         // 旋转修正0-360
//         let rotate = result.rotate

//         if (rotate < 0) {
//             rotate = rotate + 360
//         }

//         // 坐标系修正
//         let mp
//         if (rotate == 0 || rotate == 180) {
//             mp = 0
//         } else if (rotate <= 90) {
//             mp = Math.PI / (180 / rotate)
//         } else if (rotate > 90 && rotate < 180) {
//             mp = Math.PI / (180 / (180 - rotate))
//         } else if (rotate > 180 && rotate < 270) {
//             mp = Math.PI / (180 / (rotate - 180))
//         } else if (rotate >= 270 && rotate <= 360) {
//             mp = Math.PI / (180 / (360 - rotate))
//         }

//         // 旋转纠偏
//         let svw = (this.data.imgInfo.width - result.scale * (this.data.imgInfo.width * Math.cos(mp) + this.data.imgInfo.height * Math.sin(mp))) / 2

//         let svh = (this.data.imgInfo.height - result.scale * (this.data.imgInfo.width * Math.sin(mp) + this.data.imgInfo.height * Math.cos(mp))) / 2

//         let params = {
//             image_url: imageURL,
//             editor_scale: this.editorScale,
//             scale: result.scale,
//             x: result.x + svw,
//             y: result.y + svh,
//             image_width: this.data.imgInfo.width,
//             image_height: this.data.imgInfo.height,
//             rotate: rotate,
//             media_type: this.data.mode
//         }

//         console.log('证件照合成参数', params, app.openId)

//         app.tmpIDParams = params

//         try {
//             const resp = yield request({
//                 url: app.apiServer + `/boxapi/v3/images/id_convert`,
//                 method: 'POST',
//                 dataType: 'json',
//                 data: params
//             })

//             if (resp.data.code != 0) {
//                 throw (resp.data)
//             } else {
//                 this.longToast.toast()
//                 console.log('相馆证件照合成', resp.data)
//                 let url = resp.data.url
//                 let preview_url = resp.data.preview_url
//                 let params = {
//                     url: resp.data.url,
//                     preview_url: encodeURIComponent(resp.data.preview_url),
//                     mode: this.data.mode,
//                     imageURL: imageURL,
//                 }
//                 wx.redirectTo({
//                     url: `mode?idPrint=${JSON.stringify(params)}`
//                 })
//             }
//         } catch (e) {
//             console.error(e)
//             this.longToast.toast()
//             util.showErr(e)
//             return null
//         }

//     }),
//     loopGetOpenId: co.wrap(function*() {
//         let loopCount = 0
//         let _this = this
//         if (app.openId) {
//             console.log('openId++++++++++++----', app.openId)
//             return
//         } else {
//             setTimeout(function() {
//                 loopCount++
//                 if (loopCount <= 100) {
//                     console.log('openId not found loop getting...')
//                     _this.loopGetOpenId()
//                 } else {
//                     console.log('loop too long, stop')
//                 }
//             }, 2000)
//         }
//     }),

// })
