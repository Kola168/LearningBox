"use strict"
const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
import {
    co,
    util,
    _
  } from '../../../../utils/common_import'

const getFileInfo = util.promisify(wx.getFileInfo)
const getImageInfo = util.promisify(wx.getImageInfo)
const showModal = util.promisify(wx.showModal)
const MAXSIZE = 20000000;
const imginit=require('../../../../utils/imginit')
import commonRequest from '../../../../utils/common_request.js'
import chooseImgWay from '../../../../utils/showActionImg';
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
Page({
    data: {
        percent:0,
        showupLoad: false, //progress 状态
        maxFileCount: 200, //最大数量
        completeCount: 0, //一次递加上传完成数量
        currentChooseCount: 0, // 一次选择数量
        totalCount: 0, //总数量
        imageList: [], //图片列表
        fileList: [], //文件列表
        originImages: null,
        images: null,
        capabilityInfo: null //文件打印能力信息
    },
    onLoad: function (options) {
        this.loadFilePrintCapability()
        // setInterval(()=>{
        //     if (this.data.percent >=100)this.data.percent = 0
        //     this.data.percent = this.data.percent+ 1
        //     logger.info('xxxxxxxx',this.data.percent)
        //     this.setData({percent: this.data.percent})
        // },200)
    },
    onShow: function () {

    },
    // 加载文件打印能力信息
    loadFilePrintCapability: co.wrap(function*(){
        try {
             // 初始化打印配置
             let resp = yield commonRequest.getPrinterCapability()
             let capabilityInfo = {
                 duplex: false,
                 number: 1
             }
             if (resp) {
                capabilityInfo.color = resp.color_modes[0]
             } else {
                capabilityInfo.color = "Color"
             }

             this.setData({
                capabilityInfo: capabilityInfo
            })
        } catch(err) {
            logger.info(err)
        }
    }),
    // 选择文件
    chooseFiles: co.wrap(function*(){
        try {
            const { SDKVersion } = wx.getSystemInfoSync()
            const count = Math.min(Math.max(this.data.maxFileCount - this.data.totalCount,0),5)
            if (count <= 0)  {
                return wx.showModal({
                    title: '提示',
                    content: '文件数量已经超过200个，请删减后再次上传',
                    confirmColor: '#2086ee',
                    confirmText: "确认",
                    showCancel: false
                })
            }

            if (util.compareVersion(SDKVersion, '2.6.0')) {
                wx.chooseMessageFile({
                    type: 'file',
                    count: count, 
                    success: (res) => {
                        logger.info('res.tempFiles',res.tempFiles)
                       this.utilsMessageFiles(res.tempFiles);
                    },
                    fail: ()=> {
                        logger.info('选取文件失败')
                        util.showErr({
							message:'文件获取失败，请重试~'
						})
                    },
                    complete: ()=> {
                        logger.info('选取文件完成')
                    }
                })
            } else {
                //请升级到最新的微信版本
                yield showModal({
                    title: '微信版本过低',
                    content: '请升级到最新的微信版本',
                    confirmColor: '#2086ee',
                    confirmText: "确认",
                    showCancel: false
                })
            }

        } catch (e) {
            logger.info(e)
        }
    
    }),
    // 处理文件
    utilsMessageFiles: co.wrap(function *(tempFilesList){
        let tempFiles = _(tempFilesList).clone()
        let newFiles = util.clearFile(tempFiles) //检查文件格式
        if (!newFiles.length) {
            return  wx.showModal({
                title: '提示',
                content: '上传文件为空，请重新选择',
                confirmColor: '#2086ee',
                confirmText: "确认",
                showCancel: false
            })
        }
        yield this.initProgressStatus(newFiles) //初始化进度条
        const isFile = true;
        const filesList = yield this.syncLoadFiles(newFiles, tempFilesList,'files', isFile)
        
        filesList && filesList.forEach(file=>{

            this.setData({
                [`fileList[${this.data.fileList.length}]`]: {
                    key: 'files',
                    files: file
                }
             })
        })
        logger.info(filesList,'===filesList===')
    }),
    // 选择图片
    chooseImgs: co.wrap(function *() {
       try {
           let _this = this;
            let maxFileCount = this.data.maxFileCount;
            let totalCount = this.data.totalCount;
            const limit = Math.min(9,Math.max((maxFileCount - totalCount),0))
            const imgs = yield chooseImgWay(limit); //选择上传文件方式
            const newImages = yield this.checkImgSize(imgs) //检测文件格式
            yield this.initProgressStatus(newImages) //初始化进度条
            const imageList = yield this.syncLoadFiles(newImages, imgs) //并行上传
            logger.info(imageList,'====imageList====')
            imageList && imageList.forEach(img=>{
                _this.setData({
                    [`fileList[${_this.data.fileList.length}]`]: {
                        key: 'image',
                        files: img
                    }
                 })
            })
            
       } catch(err) {
            logger.info(err)
       }

    }),
    // 检验图片尺寸
    checkImgSize: function (images) {
        let newImages = []
        return new Promise((resolve,reject) => {
            try {
                images.length && images.forEach(co.wrap(function*(image, index) {
                    let path = (typeof image == 'string') ? image : image.path; // 微信文件时为object
                    let imageInfo = yield getImageInfo({
                        src: path
                    });
                    const files = yield getFileInfo({filePath: path})
                    // 过滤正确情况下进行上传
                    
                    const codition1 = (files && files.size > MAXSIZE); // 微信文件判断 size > 20000000
                    const codition2 = (imageInfo.width / imageInfo.height > 5) || (imageInfo.height / imageInfo.width > 5);
                    const isLastTime = (index === images.length - 1);
                    if (codition1 || codition2) { 
                        isLastTime && logger.info('进行过滤')
                    } else {
                        newImages.push(path) 
                    }

                    if (isLastTime) {
                        resolve(newImages)
                    }
    
                }))
            } catch (err) {
                reject(err)
            }
        })
    },
    upLoadFiles: function (paths,getProgress, isFile, baseVersion = '1.4.0') {
        try {
            const checkBaseVersion = app.checkBaseVersion(baseVersion) // 检查版本兼容
            const newPaths = !isFile && typeof paths === 'object' ? paths.path : paths; //区分选择文件上传和普通上传的格式区分
            return new Promise((resolve,reject)=>{
                app.newUploadPhotos(checkBaseVersion, [newPaths], (index, url)=> {
                    if (index !== '' && url !== '') { //上传完成
                        resolve({url: url})
                    } else if (app.cancelUpload) { //手动停止
                        resolve(false)
                    } else { // 上传异常
                        resolve(false)
                    }
                },getProgress, isFile)
            })
        } catch(err) {
            logger.info(err)
        }
    },
    // 并行上传图片、文件 | 过滤处理
    syncLoadFiles: co.wrap(function*(newFiles, originFiles, type='image', isFile) {
        let _this = this;
        let successTask = [],errTask = [];
        return new Promise((resolve,reject)=>{
            try {
                if (newFiles.length) {
                    newFiles.forEach(co.wrap(function*(currentFile) {
                        let newLoadFile = yield _this.upLoadFiles(currentFile, _this.loadProgress, isFile) //图片上传
                        yield _this.resetProgress(newFiles) //清除重置进度数
                        yield _this.updateProgressStatus(originFiles, newFiles) //上传完成后处理
                        if (newLoadFile) { //是否成功上传数据
                            newLoadFile = yield _this.accordFiles(newLoadFile, type, currentFile) //组织不同数据格式
                            successTask.push(newLoadFile) // 追加有效文件
                        } else {
                            errTask.push([]) //追加异常数量
                        }
                        const mainTask = [].concat(successTask,errTask); //合并
                        if (mainTask.length === newFiles.length) { // 上传完成 last times
                            resolve(successTask) //返回成功上传的有效数据
                        }
                    }))

                } else {
                    this.updateProgressStatus(originFiles, newFiles)
                    resolve([])
                }
            } catch (err) {
                wx.showModal({
                    title: '上传失败',
                    content: '网络异常,请检查网络是否稳定后再次上传',
                    showCancel: false,
                    confirmColor: '#FFE27A'
                })
                logger.info(err)
            }
        })
        
    }),
    // 处理不同数据格式
    accordFiles: function(newLoadFile, type, currentFile){
        try {
            let _this = this;
            return new Promise(co.wrap(function*(resolve,reject){
                if (type === 'image') { // 类型为图片类型
                    newLoadFile = yield _this.resetImg(newLoadFile) //格式化图片
                } else { //文件类型切换格式
                    newLoadFile = Object.assign(newLoadFile, {
                        filename: currentFile.name,
                        color: _this.data.capabilityInfo.color,
                        duplex: _this.data.capabilityInfo.duplex,
                        number: 1,
                        isSetting: false,
                        display: 1
                    })
                }
                resolve(newLoadFile)
            }))
        } catch(err) {
            logger.info(err)
        }
    },
    // 初始化进度条状态
    initProgressStatus: co.wrap(function*(tempList) {
        app.cancelUpload = false //取消上传状态消除
        this.setData({
            currentChooseCount: tempList.length,
            completeCount: 0, //清空上次上传完成数量
            showupLoad: true
        })
    }),
    // 重置进度数
    resetProgress: co.wrap(function *(tempList) {
        let completeCount = tempList.length ? this.data.completeCount + 1 : this.data.completeCount; //判断可上传图片是否 > 1
        this.setData({
            completeCount: completeCount, //单词上传完成的已完成的数量
            percent: 0, // 单个进度数重置
        })
    }),
    // 更新上传后状态
    updateProgressStatus: co.wrap(function *(originTempList, tempList) {
        let originTempListLen = originTempList.length;
        let tempListLen = tempList.length;
        let { currentChooseCount, completeCount } = this.data;
        let totalCount = this.data.totalCount = tempList.length ? this.data.totalCount + 1 : this.data.totalCount; //判断可上传图片是否 > 1
        
        clearTimeout(this.timer)
        this.timer = setTimeout(()=>{
              // 进度条状态处理
            this.setData({
                totalCount: totalCount,
                showupLoad: !(completeCount === currentChooseCount),
            })
            // 上传完成进行筛选过滤提示
            if (completeCount === currentChooseCount && originTempListLen > tempListLen) {
                wx.showToast({
                    title: `有${originTempListLen - tempListLen}个文件过大无法上传`,
                    icon: 'none',
                    duration: 2500,
                    mask: true,
                })
            }
        },100)
    }),
    // 图片格式化
    resetImg: co.wrap(function *({url}) {
        let orientationInfo = yield imginit.imgInit(url, 'vertical')
        let imageInfo = orientationInfo.imageInfo; 
        let localUrl = orientationInfo.imgNetPath; //未加后缀原图

        return {
            url: imginit.addProcess(localUrl),
            origin_url: localUrl,
            orientation: orientation,
            width: imageInfo.width,
            height: imageInfo.height
        }

    }),
     // 进度条进度值
    loadProgress: function (progress) {
        if (progress !== 'noProgress') {
            this.setData({
                percent: progress
            })
        }
    },
    // 跳转打印
    toPrint: function (e) {
        const { index } = e.currentTarget.dataset
        const key = this.data.fileList[index].key
        switch (key) {
            case 'image':
                wx.navigateTo({
                    url: `../photo_preview/preview?image=${encodeURIComponent(JSON.stringify(this.data.fileList[index]['files']))}`
                });
                break; 
            case 'files': 
                this.settingFilesParams(this.data.fileList[index]['files'])
                break;
        }
    },
    // 处理文件打印参数
    settingFilesParams: co.wrap(function*(currentFile) {
        let print_capability = yield commonRequest.getPrinterCapability(currentFile.url)
        logger.info('获取打印能力成功', print_capability)
       
        if (print_capability) {
            try {
                let postData = {
                    page_count: print_capability.page_count,
                    name: currentFile.filename,
                    colorModes: print_capability.color_modes,
                    media_sizes: print_capability.media_sizes,
                    colorcheck: currentFile.color,
                    duplexcheck: currentFile.duplex,
                    isSetting: currentFile.isSetting,
                    url: currentFile.url
                }
                wx.navigateTo({
                    url: `../setting/index?files=${encodeURIComponent(JSON.stringify(postData))}`,
                })
            } catch (e) {
                this.longToast.toast()
                util.showErr(e)
            }
        }
    }),
    cancel: function () {
        app.cancelUpload = true //手动取消上传
        this.setData({
            showupLoad: false, //关闭弹窗
        })
    },
    onReachBottom: function () {

    },
    onShareAppMessage: function () {

    }
})