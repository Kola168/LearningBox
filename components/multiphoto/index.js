// pages/gallery/component/multiphoto/index.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const _ = require('../../lib/underscore/we-underscore')
const upload = require('../../utils/upload')

const getSystemInfo = util.promisify(wx.getSystemInfo)
const chooseMessageFile = util.promisify(wx.chooseMessageFile)
const chooseImage = util.promisify(wx.chooseImage)
const getImageInfo = util.promisify(wx.getImageInfo)
const canvasToTempFilePath = util.promisify(wx.canvasToTempFilePath)
const downloadFile = util.promisify(wx.downloadFile)
const showModal=util.promisify(wx.showModal)

let Loger=(app.apiServer!='https://epbox.gongfudou.com'||app.deBug)?console.log:function(){}

// 照片编辑组件介绍
// 参数：
//   id  //唯一的id值，不可重复，用于调用组件页面选中组件调用方法
//     例：this.selectComponent("#mymulti").getImgPoint()为调用组件内获取点位坐标方法在调用方法内详细解释
//   mode-info  //传入组件内的单个模板信息
//     类型：Object
//     详情：
//     {
//       modeSrc:''  模板蒙层的网络路径  如果没有就不需要传这个字段
//       modeSize:[{  //数组  可传入多个编辑区域
//         x   //模板编辑区域的x轴偏移量
//         y   //同上y轴
//         areaWidth  //编辑区域的宽度
//         areaHeight  //编辑区域的高度中心Ω   
//       }]
//     }
//
//
//   mode-paper  //打印纸张尺寸
//   类型：Object
//   详情:
//     {
//       width: 1300,
//       height: 1950, //单位px
//       heightPer: 0.68 //照片编辑区域所占高度比例
//       minLeftHeight: 260   //照片下方空出区域
//       sider:200   //边缘留出的空隙（两遍总和）
//     }
//
//
//   img-path   //编辑的照片的路径，本地，网络都可  （可不传）
//   类型：String
//
//
// show-change  //是否显示照片上的删除更换照片蒙层  （可不传默认不显示）
// 类型：String



Component({
    properties: {
        modePaper: {
            type: Object,
            observer: function(newVal, oldVal) {
                Loger(newVal)
                if (_.isEqual(newVal, oldVal)) {
                    return
                }
                if (_.isNotEmpty(newVal)) {
                    this.initWindow(newVal)
                }
            }
        },
        modeInfo: {
            type: Object,
            observer: function(newVal, oldVal) {
                Loger(newVal)
                if (_.isNotEmpty(newVal)) {
                    if (!_.isArray(newVal.modeSize)) {
                        Loger(newVal.modeSize)
                        let newArr = []
                        newArr.push(newVal.modeSize)
                        newVal.modeSize = newArr
                    }
                    Loger(newVal.modeSize)
                    this.setData({
                        TemplateSrc: newVal.modeSrc,
                        TemplateSizeArr: newVal.modeSize,
                    })
                    this.changeTemplate(newVal)
                }
            }
        },
        imgPath: {
            type: String,
            observer: function(newVal, oldVal) {
                Loger(newVal)
                if (_.isEqual(newVal, oldVal)) {
                    return
                }
                if (_.isNotEmpty(newVal)) {
                    this.setData({
                        photoSrc: newVal
                    })
                    if (_.isNotEmpty(this.data.editAreaSize)) {
                        this.choosedImgIndex = 0
                        this.imgChooseInit({ path: this.data.photoSrc })
                        this.setData({
                            photoSrc:''
                        })
                    }
                }
            }
        },
        imgInfo:{
          type: Object,
          observer: function(newVal, oldVal) {
              if (_.isNotEmpty(newVal)) {
                  this.setData({
                      photoInfo: newVal,
                  })
              }
          }
        },
        showChange: {
            type: String,
            observer: function(newVal, oldVal) {
                Loger('--------------',newVal)
                if (_.isEqual(newVal, oldVal)) {
                    return
                }
                if(_.isString(newVal)){
                    newVal=JSON.parse(newVal)
                }
                this.setData({
                    showchange: newVal
                })
            }
        },
        border: { //边框颜色
            type: String,
            observer: function(newVal, oldVal) {
                Loger('--------------', newVal)
                if (_.isEqual(newVal, oldVal)) {
                    return
                }
                if(!_.isEmpty(newVal)){
                    this.setData({
                        borderColor: newVal
                    })
                }

            }
        },
        visible:{  //是否溢出隐藏  'visible','hidden'
            type:String,
            observer: function(newVal, oldVal) {
                Loger('--------------', newVal)
                if (_.isEqual(newVal, oldVal)) {
                    return
                }
                if(!_.isEmpty(newVal)){
                    this.setData({
                        visible: newVal
                    })
                }
            }
        },
        addIcon:{
            type:String,
            observer: function(newVal, oldVal) {
                Loger('--------------', newVal)
                if (_.isEqual(newVal, oldVal)) {
                    return
                }
                if(!_.isEmpty(newVal)){
                    this.setData({
                        addImgIcon: newVal
                    })
                }
            }
        },
        deleteIcon:{
            type:String,
            observer: function(newVal, oldVal) {
                Loger('--------------', newVal)
                if (_.isEqual(newVal, oldVal)) {
                    return
                }
                if(!_.isEmpty(newVal)){
                    this.setData({
                        deleteIcon: newVal
                    })
                }
            }
        },
        deleteEdge:{
          type:Boolean,
          value:false,
          observer: function(newVal, oldVal) {
            Loger(newVal)
              if(newVal){
                  this.setData({
                      deleteEdge: newVal
                  })
              }
          }
        }
    },
    observers: {
      'addIcon, deleteIcon': function() {
        // 在 numberA 或者 numberB 被设置时，执行这个函数
        this.setData({
          showAdd: true
        })
      }
    },
    data: {
        TemplateSrc: '', //模板图片链接地址
        photoSrc: '', //组件传递过来的图片链接
        photoInfo:{}, //组件传过来的图片信息
        TemplateSizeArr: [], //模板位置区域
        //窗口默认尺寸
        paperSize: {
            width: 1300,
            height: 1950,
            heightPer: 1,
            minLeftHeight:200,
            sider:200,
        },
        areaSize: {}, //整个照片模板可显示区域尺寸
        editAreaSize: [], //编辑区域尺寸
        imgArr: [], //用户上传图片数组
        globalData: [], //全局数据

        popWindow: false, //展示照片尺寸选择
        borderColor:null, //时是否展会编辑区域边框，及边框颜色
        showBorder:false,  //是否展示边缘框
        visible:'hidden', //是否溢出隐藏
        addImgIcon:'', //添加图片图标
        deleteIcon:'', //删除图片图标
        showAdd:false, //展示添加图标
        deleteEdge:false, //删除图标顶边显示
    },

    methods: {
        //初始化模板窗口
        initWindow: co.wrap(function*(size) {

            wx.showLoading({
                title: '模板初始化中',
                mask: true
            })
            try {
                Loger(size)
                //设置默认尺寸
                if (!_.isNotEmpty(size.width)) {
                    size.width = Number(this.data.paperSize.width)
                }
                if (!_.isNotEmpty(size.height)) {
                    size.height = Number(this.data.paperSize.height)
                }
                if (!_.isNotEmpty(size.heightPer)) {
                    size.heightPer = Number(this.data.paperSize.heightPer)
                }
                if (!_.isNotEmpty(size.minLeftHeight)) {
                    size.minLeftHeight = Number(this.data.paperSize.minLeftHeight)
                }
                if (!_.isNotEmpty(size.sider)) {
                    size.sider = Number(this.data.paperSize.sider)
                }
                this.setData({
                    paperSize: size
                })
                Loger(size)
                //获取当前系统屏幕宽高
                const res = yield getSystemInfo()
                Loger(res.windowHeight)
                let avaWidth = res.windowWidth-size.sider* res.windowWidth / 750
                let avaHeight = res.windowHeight * size.heightPer-65
                if ((res.windowHeight - avaHeight) < (size.minLeftHeight * res.windowWidth / 750)) {
                    avaHeight = res.windowHeight - size.minLeftHeight * res.windowWidth / 750-65
                }
                let areaSize = {} //模板尺寸
                if ((size.width / size.height) > (avaWidth / avaHeight)) {
                    areaSize.width = avaWidth
                    areaSize.height = areaSize.width * (size.height / size.width)
                } else {
                    areaSize.height = avaHeight
                    areaSize.width = areaSize.height * (size.width / size.height)
                }
                areaSize.scale = areaSize.width / size.width
                this.setData({
                    areaSize: areaSize
                })
                if(!_.isEmpty(this.data.TemplateSizeArr)){
                    this.changeTemplate({
                        modeSize:this.data.TemplateSizeArr
                    })
                }
                Loger(this.data.areaSize)
            } catch (e) {
                wx.hideLoading()
                Loger(e)
            }
        }),

        //初始化多块编辑区域
        initTemplate: co.wrap(function*(templateArr) {
            Loger('templateArr----------',templateArr,this.data.areaSize)
            try {
                let that = this
                let modeScale = this.data.areaSize.scale
                that.data.editAreaSize = []
                _.each(templateArr, function(value, index, list) {
                    Loger(index)
                    that.data.editAreaSize[index] = {
                        x: value.x * modeScale,
                        y: value.y * modeScale,
                        areaWidth: value.areaWidth * modeScale,
                        areaHeight: value.areaHeight * modeScale,
                    }
                })
                Loger(that.data.editAreaSize)
                this.setData({
                    editAreaSize: this.data.editAreaSize
                })
                wx.hideLoading()
                if (_.isNotEmpty(this.data.photoSrc)) {
                    this.choosedImgIndex = 0
                    yield this.imgChooseInit({ path: this.data.photoSrc })
                    this.setData({
                        photoSrc:''
                    })
                }

            } catch (e) {
                wx.hideLoading()
                Loger(e)
            }
        }),

        cutting:function(){
            this.imgChooseInit({ path: this.data.photoSrc, type: 'uploaded',clipMode:'cutting' })
        },

        message:function(){
            this.imgChooseInit({ path: this.data.photoSrc, type: 'uploaded',clipMode:'message' })
        },

        //选择图片初始化
        imgChooseInit: co.wrap(function*(img) {
            wx.showLoading({
                title: '图片初始化中',
                mask: true
            })
            let that = this
            try {
                if (img.size > 20000000) {
                    return wx.showModal({
                        title: '图片过大',
                        content: '图片大小过大',
                        showCancel: false,
                        confirmColor: '#fae100',
                        success: function(res) {
                            wx.hideLoading()
                        }
                    })
                }

                let imgDetail = yield this.upLoadAndInit(img)
                //设定编辑区域
                let editArea = this.data.editAreaSize[this.choosedImgIndex]
                Loger(imgDetail,editArea)
                //初始化图片与编辑区域
                let sv = util._getSuiteValues(imgDetail.imageInfo.width, imgDetail.imageInfo.height, editArea.areaWidth, editArea.areaHeight)
                Loger(sv)
                this.data.imgArr[this.choosedImgIndex] = {}
                let messageScale=1
                if(img.clipMode){
                    if(img.clipMode=='cutting'){
                        messageScale=1
                    }else if(img.clipMode=='message'){
                        messageScale=(editArea.areaWidth/sv.width)*(editArea.areaHeight/sv.height)
                    }
                }
                let imgInfo = {
                    width: sv.width*messageScale,
                    height: sv.height*messageScale,
                    scale: 1,
                    startScale: 1,
                    left: sv.left+(sv.width-sv.width*messageScale)/2,
                    top: sv.top+(sv.height-sv.height*messageScale)/2,
                    rotate: 0,
                    startRotate: 0,
                }
                imgInfo.imgOriginalInfo = imgDetail.imageInfo
                imgInfo.imgOriginalInfo.scale = sv.scale*messageScale
                imgInfo.imgOriginalInfo.left = sv.left+(sv.width-sv.width*messageScale)/2
                imgInfo.imgOriginalInfo.top = sv.top+(sv.height-sv.height*messageScale)/2
                imgInfo.imgOriginalInfo.rotate = 0
                imgInfo.phtotSrc = imgDetail.imgNetPath
                let imgArr = `imgArr[${this.choosedImgIndex}]`
                let globalData = `globalData[${this.choosedImgIndex}]`
                this.setData({
                    [imgArr]: imgInfo,
                    [globalData]: {}
                })
                Loger(this.data.imgArr)
                wx.hideLoading()
            } catch (e) {
                wx.hideLoading()
                wx.showModal({
                    title: '错误',
                    content: '图片加载出错',
                    showCancel: false,
                    confirmColor: '#fae100',
                    success: function(res) {
                        wx.hideLoading()
                    }
                })
                Loger(e)
            }
        }),

        upLoadAndInit: co.wrap(function*(imgPath) {
            if (imgPath.type == 'uploaded') {
                return {
                    imgNetPath: this.data.imgArr[this.choosedImgIndex].phtotSrc,
                    imageInfo: this.data.imgArr[this.choosedImgIndex].imgOriginalInfo
                }
            }
            if(_.isNotEmpty(this.data.photoInfo)){
              let initialImgInfo=_.deepClone(this.data.photoInfo)
              this.setData({
                photoInfo:{}
              })
              return {
                imgNetPath: imgPath.path,
                imageInfo: initialImgInfo
              }
            }
            try {
                let imgNetPath
                Loger(imgPath.path.indexOf('https://cdn-h.gongfudou.com/'))
                if (imgPath.path.indexOf('https://cdn-h.gongfudou.com/') < 0) {
                    try {
                        imgNetPath = yield upload.uploadFile(imgPath.path)
                    } catch (e) {
                        Loger(e)
                        imgNetPath = imgPath.path
                    }
                } else {
                    imgNetPath = imgPath.path
                }
                Loger(imgNetPath)
                let imageInfo
                try {
                    imageInfo = yield getImageInfo({
                        src: imgNetPath
                    })
                } catch (e) {
                    Loger('获取图片信息失败，再次获取11111', e)
                    imageInfo = yield getImageInfo({
                        src: imgNetPath
                    })
                }
                Loger('imageInfo====', imageInfo)

                wx.showLoading({
                    title: '图片矫正中',
                    mask: true
                })
                if (imageInfo.orientation != 'up') {
                    if (imageInfo.width > 4000 || imageInfo.height > 4000) {
                        wx.showLoading({
                            title: '图片压缩中',
                            mask: true
                        })
                        imgNetPath = this.addProcess(imgNetPath, '/resize,w_4000,h_4000')
                        if (imageInfo.width > imageInfo.height) {
                            imageInfo.height = 4000 * imageInfo.height / imageInfo.width
                            imageInfo.width = 4000
                        } else {
                            imageInfo.width = 4000 * imageInfo.width / imageInfo.height
                            imageInfo.height = 4000
                        }
                    }
                    imgNetPath = this.addProcess(imgNetPath, '/auto-orient,1')
                    if (imageInfo.orientation == 'left' || imageInfo.orientation == 'left-mirrored' || imageInfo.orientation == 'right' || imageInfo.orientation == 'right-mirrored') {
                        let newHeight = imageInfo.height
                        imageInfo.height = imageInfo.width
                        imageInfo.width = newHeight
                    }
                }
                // if(imageInfo.width>imageInfo.height){
                //     imgNetPath = this.addProcess(imgNetPath, '/rotate,90')
                //     let newHeight = imageInfo.height
                //     imageInfo.height = imageInfo.width
                //     imageInfo.width = newHeight
                // }
                return { imgNetPath: imgNetPath, imageInfo: imageInfo }
            } catch (e) {
                Loger(e)
            }
        }),
        addProcess: function(imgUrl, process) {
            if (!process) {
                process = ''
            }
            if (imgUrl.indexOf('https://cdn-h.gongfudou.com') >= 0 && imgUrl.indexOf('?x-image-process=image') < 0) {
                imgUrl += '?x-image-process=image'
            } else if (imgUrl.indexOf('https://cdn.gongfudou.com') >= 0 && imgUrl.indexOf('?x-oss-process=image') < 0) {
                imgUrl += '?x-oss-process=image'
            }
            if(imgUrl.indexOf('https://cdn-h.gongfudou.com') >= 0&&process.indexOf('/resize') >= 0){
                process+='/marker,u_plus'
            }

            return imgUrl + process
        },
        reupload: co.wrap(function*(imgPath) {
            const download = yield downloadFile({
                url: imgPath
            })
            return yield app.uploadImage(download.tempFilePath)
        }),

        onTouch: function(e) {
            this.moveIndex = e.currentTarget.dataset.index
            if (!this.data.imgArr[this.moveIndex]) {
                return
            }
            this.setData({
                showBorder:true
            })
            try {
              Loger(e)
                this.data.globalData[this.moveIndex].lastMoveX = 0
                this.data.globalData[this.moveIndex].lastMoveY = 0
                this.data.globalData[this.moveIndex].scale = this.data.imgArr[this.moveIndex].scale
                this.data.globalData[this.moveIndex].rotate = this.data.imgArr[this.moveIndex].rotate
                this.data.globalData[this.moveIndex].twoPoint = false
                this.data.globalData[this.moveIndex].moveX=this.data.imgArr[this.moveIndex].left
                this.data.globalData[this.moveIndex].moveY=this.data.imgArr[this.moveIndex].top
                if (e.touches.length == 2) {
                    // 双指操作
                    this.data.globalData[this.moveIndex].twoPoint = true
                    let xLen = Math.abs(e.touches[1].pageX - e.touches[0].pageX)
                    let yLen = Math.abs(e.touches[1].pageY - e.touches[0].pageY)
                    this.data.globalData[this.moveIndex].touchDistance = util._getDistance(xLen, yLen)
                    this.data.globalData[this.moveIndex].touchVector = {
                        x: e.touches[1].pageX - e.touches[0].pageX,
                        y: e.touches[1].pageY - e.touches[0].pageY
                    }
                } else {
                    // 单指操作
                    this.data.globalData[this.moveIndex].twoPoint = false
                    this.data.globalData[this.moveIndex].touchX = e.touches[0].pageX
                    this.data.globalData[this.moveIndex].touchY = e.touches[0].pageY
                }
            } catch (e) {
                Loger(e)
            }
        },

        onTouchMove: function(e) {
            if (!this.data.imgArr[this.moveIndex]) {
                return
            }
            Loger(e)
            // 显示编辑区域边框
            try {
                if (this.data.globalData[this.moveIndex].twoPoint === true) {
                    // 缩放
                    let xMove = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
                    let yMove = Math.abs(e.touches[0].pageY - e.touches[1].pageY);

                    let changedDistance = util._getDistance(xMove, yMove);
                    let scale = (this.data.imgArr[this.moveIndex].startScale * changedDistance / this.data.globalData[this.moveIndex].touchDistance).toFixed(3)
                    // 缩放最大边4096
                    if (scale * this.data.imgArr[this.moveIndex].width/this.data.areaSize.scale <= 4000 && scale * this.data.imgArr[this.moveIndex].height/this.data.areaSize.scale <= 4000) {
                        this.data.globalData[this.moveIndex].scale = scale
                    }
                    // 旋转
                    this.data.globalData[this.moveIndex].changedVector = {
                        x: e.touches[1].pageX - e.touches[0].pageX,
                        y: e.touches[1].pageY - e.touches[0].pageY
                    }
                    let angel = util._getRotateAngle(this.data.globalData[this.moveIndex].changedVector, this.data.globalData[this.moveIndex].touchVector);
                    this.data.globalData[this.moveIndex].rotate = util._snapToAngle(this.data.imgArr[this.moveIndex].startRotate + angel, 90, 5);
                    this.data.imgArr[this.moveIndex].scale = this.data.globalData[this.moveIndex].scale,
                        this.data.imgArr[this.moveIndex].rotate = this.data.globalData[this.moveIndex].rotate
                    let imgArr = `imgArr[${this.moveIndex}]`
                    this.setData({
                        [imgArr]: this.data.imgArr[this.moveIndex]
                    })
                } else {
                    // 移动

                    this.data.globalData[this.moveIndex].moveX = this.data.imgArr[this.moveIndex].left + e.touches[0].pageX - this.data.globalData[this.moveIndex].touchX - this.data.globalData[this.moveIndex].lastMoveX

                    this.data.globalData[this.moveIndex].moveY = this.data.imgArr[this.moveIndex].top + e.touches[0].pageY - this.data.globalData[this.moveIndex].touchY - this.data.globalData[this.moveIndex].lastMoveY

                    this.data.globalData[this.moveIndex].lastMoveX = e.touches[0].pageX - this.data.globalData[this.moveIndex].touchX
                    this.data.globalData[this.moveIndex].lastMoveY = e.touches[0].pageY - this.data.globalData[this.moveIndex].touchY
                    this.data.imgArr[this.moveIndex].left = this.data.globalData[this.moveIndex].moveX
                    this.data.imgArr[this.moveIndex].top = this.data.globalData[this.moveIndex].moveY
                    this.data.imgArr[this.moveIndex].scale = this.data.globalData[this.moveIndex].scale
                    this.data.imgArr[this.moveIndex].rotate = this.data.globalData[this.moveIndex].rotate
                    let imgArr = `imgArr[${this.moveIndex}]`
                    this.setData({
                        [imgArr]: this.data.imgArr[this.moveIndex]
                    })
                }
            } catch (e) {
                Loger(e)
            }
        },

        onTouchEnd: function() {
            if (!this.data.imgArr[this.moveIndex]) {
                return
            }
            this.setData({
                showBorder:false
            })
            if (this.data.imgArr[this.moveIndex]) {
                this.data.imgArr[this.moveIndex].left = this.data.globalData[this.moveIndex].moveX
                this.data.imgArr[this.moveIndex].top = this.data.globalData[this.moveIndex].moveY
                this.data.imgArr[this.moveIndex].startScale = this.data.globalData[this.moveIndex].scale
                this.data.imgArr[this.moveIndex].startRotate = this.data.globalData[this.moveIndex].rotate
                let imgArr = `imgArr[${this.moveIndex}]`
                this.setData({
                    [imgArr]: this.data.imgArr[this.moveIndex]
                })
            }

        },

        //未初始化图片获取点位坐标信息参数信息：
        // data:[{
        //     templateSize:{}  //模板尺寸
        //     imgInfo:{path:'',width:'',height:''}
        // }]
        getImgsPoints:function(imgData,areaScal){
          try{


            let imgArr=[]
            let that=this
            _.each(imgData,function(value,index,list){
              let modeScale = areaScal||that.data.areaSize.scale
              let editArea={
                x: value.templateSize.x * modeScale,
                y: value.templateSize.y * modeScale,
                areaWidth: value.templateSize.areaWidth * modeScale,
                areaHeight: value.templateSize.areaHeight * modeScale,
              }
              let sv = util._getSuiteValues(value.imgInfo.width, value.imgInfo.height, editArea.areaWidth, editArea.areaHeight)
              let imgInfo = {
                  width: sv.width,
                  height: sv.height,
                  scale: 1,
                  startScale: 1,
                  left: sv.left+(sv.width-sv.width)/2,
                  top: sv.top+(sv.height-sv.height)/2,
                  rotate: 0,
                  startRotate: 0,
              }
              imgInfo.imgOriginalInfo = value.imgInfo
              Loger(imgInfo.imgOriginalInfo, value.imgInfo , sv)
              imgInfo.imgOriginalInfo.scale = sv.scale
              imgInfo.imgOriginalInfo.left = sv.left+(sv.width-sv.width)/2
              imgInfo.imgOriginalInfo.top = sv.top+(sv.height-sv.height)/2
              imgInfo.imgOriginalInfo.rotate = 0
              imgInfo.phtotSrc = value.imgInfo.path
              imgArr.push(imgInfo)
            })
            return this.getImgPoint(imgArr)
          }catch(e){
            Loger(e)
          }
        },

        //获取点位信息
        getImgPoint: function(arr,scaleData) {
          try{


            let that = this
            let pointArr = []
            let imgArr=arr||this.data.imgArr
            let scale=scaleData||that.data.areaSize.scale
            Loger(imgArr)
            _.each(imgArr, function(value, index, kist) {
              if(value){
                const result = {
                    x: Number(value.left),
                    y: Number(value.top),
                    scale: parseFloat(value.scale * value.imgOriginalInfo.scale),
                    rotate: parseInt(value.rotate),
                }
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
                let svw = (value.width-result.scale * (value.imgOriginalInfo.width * Math.cos(mp) + value.imgOriginalInfo.height * Math.sin(mp))) / 2
                let svh = (value.height-result.scale * (value.imgOriginalInfo.width * Math.sin(mp) + value.imgOriginalInfo.height * Math.cos(mp))) / 2
                Loger(result,svw,svh)
                let params = {
                    editor_scale: scale,
                    scale: result.scale,
                    x: result.x + svw,
                    y: result.y + svh,
                    image_width: value.imgOriginalInfo.width,
                    image_height: value.imgOriginalInfo.height,
                    rotate: rotate,
                    image_url: value.phtotSrc
                }
                Loger(params)
                pointArr.push(params)
              }else{
                pointArr.push('')
              }

            })
            return pointArr
          }catch(e){
            Loger(e)
          }
        },

        changeTemplate: co.wrap(function*(data) {
            wx.showLoading({
                title:'初始化模板',
                mask:true
            })
            let that = this
            if(!_.isEmpty(this.data.areaSize)){
                yield this.initTemplate(data.modeSize)
            }
            // yield this.initTemplate(data.modeSize)
            for (let i = 0; i < this.data.editAreaSize.length; i++) {
                if (that.data.imgArr[i]) {
                    that.choosedImgIndex = i
                    yield that.imgChooseInit({ path: that.data.imgArr[i].phtotSrc, type: 'uploaded' })
                }
            }
        }),

        //更换图片
        changeImg: function(e) {
            let index = e.currentTarget.dataset.index
            this.choosedImgIndex = index
            this.selectComponent("#checkComponent").showPop()
        },

        //删除图片
        deleteImg: co.wrap(function*(e) {
            let res=yield showModal({
                title: '提示',
                content: '确认删除图片？',
                confirmColor: '#fae100',
            })
            if(!res.confirm){
              return
            }
            let index = e.currentTarget.dataset.index
            this.data.imgArr.splice(index,1)
            this.data.globalData.splice(index,1)
            this.setData({
                imgArr: this.data.imgArr,
                globalData: this.data.globalData
            })
        }),

        //选择图片功能
        chooseImgs: function(e) {
            this.choosedImgIndex = e.currentTarget.dataset.index
            this.selectComponent("#checkComponent").showPop()
        },

        chooseImg: co.wrap(function*(e) {
            wx.showLoading({
                title: '请稍后',
                mask: true
            })
            try {
                this.imgChooseInit(e.detail.tempFiles[0])
            } catch (e) {
                wx.hideLoading()
                Loger(e)
            }
        }),

        baiduprint:function(e){
          this.imgChooseInit(e.detail[0].url)
        },
    }
})
