//pages/print_photo_doc/choose.js
"use strict"
const app = getApp()
const logger = new Logger.getLogger('pages/index/index')
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')

const chooseImage = util.promisify(wx.chooseImage)
const showModal = util.promisify(wx.showModal)
const getNetworkType = util.promisify(wx.getNetworkType)
const chooseMessageFile = util.promisify(wx.chooseMessageFile)
// import commonRequest from '../../utils/common_request.js'

import wxNav from '../../utils/nav.js'
import Logger from '../../utils/logger.js'

Page({
	data: {
		showArea: false,
		showIndex: false,
		popWindow: false,
		showConsumablesModal: false, //耗材推荐弹窗
		consumablesIcon: false, //耗材推荐图标
		images: [],
		//图片选择器
		popWindow: false,
    canUseProgressBar: false, //判断进度条是否可用
    uploadImg: false, //上传进度条显示、隐藏
    percent: 0, //进度条百分比
    count: 0, //每次上传张数
    chooseCount: 0, // 用户选择的数量
    realCount: 0, //图片渲染前计数
    completeCount: 0, //每次上传完成数
    allCount: 0, //当前可打印图片总数
    maxCount: 8, //最大数量限制
    preAllCount: 0, //上一次所选图片数量
    //是否过滤掉了大/小图
    //显示图片过滤提示
    showInterceptModal: false,
    //图片选择器
    popWindow: false,
    media_size: {
      pic2doc: { //a4尺寸
        width: 2520,
        height: 3564,
        noRotateMin: '/resize,h_800/auto-orient,1/resize,m_mfit,h_282,w_200/quality,Q_85/format,jpg'
      }
    },
    showConfirmModal: null,
    showGetModal: false, //耗材推荐弹窗
    supply_types: '',
    consumablesIcon: false, //耗材推荐图标
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    }
	},

	onLoad: function (options) {
		this.query = options || {}
		this.initUseArea()

	},

	//初始化当前区域信息
	initUseArea: function () {
		this.media_type = 'pic2doc'
		var isNoUse = wx.getStorageSync('picToDocUseStatus') || null
		if (isNoUse) {
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
	initSingleArea: function () {
		try {
			let res = wx.getSystemInfoSync()
			let width = (res.windowWidth - 35) / 2
			let height = width / this.data.media_size[this.media_size].width * this.data.media_size[this.media_size].height
			this.setData({
				width,
				height
			})
		}
		catch (e) {
			logger.error(e)
		}
	},

	getStorageImages: function (media_type) {
		try {
			app.judgeClearStorage('2.1.3', media_type)
			let galleryImage = wx.getStorageSync(media) || {
				images: [],
				allCount: 0
			}
			if (galleryImage) {
				this.setData({
					images: galleryImage.images,
					allCount: galleryImage.allCount
				})
			}
		} catch (e) {
			logger.error('getStorageImage == 获取本地图片失败')
		}
	},

	getSupplyBefore(media_type) {
		commonRequest.getSupplyBefore(media_type).then(
			res => {
				res.supply_types && this.setData({
					supply_types: res.supply_types
				})
			}
		)
	},

	toUse: function () {
		var useStatus = 'picToDocUseStatus'
		wx.setStorageSync(useStatus, true)
		this.setData({
			showIndex: false
		})
		this.initSingleArea()
	},

	//删除照片
	deleteImg: co.wrap(function* ({ currentTarget: { id } }) {
		let images = this.data.images
		let res = yield showModal({
			title: '确认删除',
			content: '确认删除照片？',
			confirmColor: '#ffe27a'
		})
		if (!res.confirm) {
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

	hideToast: function (e) {
		if (!this.querry.gallerySource || this.querry.gallerySource == 'localStorage') {
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

	errImage: function (e) {
		if (this.querry.gallerySource) {
			return
		}
		let images = this.data.images
		images.splice(images.length - 1, 1)
		this.setData({
			images: this.data.images,
			allCount: this.data.allCount - 1
		})
		this.setStorage()
		logger.info('某张图片渲染失败后还可以继续上传的张数：', this.data.allCount)
		logger.info('某张图片渲染失败后还可以继续上传的张数：', this.data.countLimit)
	},

	previewImg: function ({ currentTarget: { id } }) {
		let image = this.data.images[id]
		wx.previewImg({
			current: image.afterEditUrl || image.url,
			urls: [image.afterEditUrl || image.url]
		})
	},

	//编辑照片
	toMoreEdit: function ({ currentTarget: { id, flag = false } }) {
		let image = this.data.images[id]
		let params = {
			url: image.localUrl,
			mode: 'quadrectangle',
			index: id,
			media_type: this.media_type,
			from: 'pic2doc',
			isSingle: !flag,
			currentCount: Math.max(this.data.images.length - this.data.preAllCount, 0) //当前选择的图片总数
		}
		wxNav.navigateTo('/pages/print_photo_doc/edit')
	},

	//减张数
	decrease: function ({ currentTarget: { id } }) {
		let images = this.data.images
		let item = this.data.images[id]
		if (item.count == 0) {
			return wx.showModal({
				title: '提示',
				content: '请先选中该照片',
				showCancel: false,
				confirmColor: '#ffe27a'
			})
		}
		//最少一张
		if (item.count <= 1) {
			return
		}
		this.setData({
			['images[${id}].count']: --images[id].count,
			allCount: this.data.allCount - 1
		})
	},

	//增张数
	increase: function () {
		let images = this.data.images
		let item = this.data.images[id]
		if (item.count == 0) {
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

	openPopWindow: function () {
		if (this.data.images.length > this.data.maxCount) {
			return wx.showModal({
				content: '已选照片达到限定数量，请重新选择上传',
				confirmText: '确认',
				showCancel: false
			})
		}
		if (this.data.uploadImg) {
			return
		}
		this.setData({
			popWindow: true
		})
	},

	closePopWindow: function () {
		this.setData({
			popWindow: false
		})
	},

	chooseImg: co.wrap(function* (e) {
		if (app.preventMoreTap(e)) {
			return
		}
		let net = yield getNetworkType()
		if (net.networktype === "none") {
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

		if (['takePhoto', 'localAlbum'].indexOf(photoSource) > -1) {
			res = yield chooseImage({
				count: countLimit,
				sizeType: ['original'],
				sourceType: sourceType
			})
    } 
    else {
			var SDKVersion
			try {
				const resInfo = wx.getSystemInfoSync()
				SDKVersion = resInfo.SDKVersion
			} catch (e) {
				logger.info(e)
			}
			if (util.compareVersion(SDKVersion, '2.5.0')) {
				res = yield chooseMessageFile({
					type: 'image',
					count: countLimit
				})
			} else {
				//请升级最新的微信版本
				yield showModal({
          title: '微信版本过低',
          content: '请升级到最新的微信版本',
          confirmColor: '#ffe27a',
          confirmText: '确认',
          showCancel: false
				})
			}
		}
    let count = res.tempFiles.length //每次选择的数量
    let tempFiles = res.tempFiles
    let paths = [] //所有选择的临时文件路径
    let maxSize = 20000000
    that.setData({
      count: count,
      preAllCount: that.data.images.length, //上一次所选图片张数
      chooseCount: count, //用户单次选择的数量，不是最终过滤的数量
      realCount: that.data.realCount + count,
      currentStartIndex: that.data.images.length
    })
logger.info('......111')
    //上传前判断进度条是否可用
    if(app.checkBaseVersion('1.4.0')){
      that.setData({
        canUseProgressBar: true
      })
    }

    //过滤大于20M的图片
    tempFiles.forEach((item, index)=> {
      if(item.size < maxSize){
        paths.push(item.path)
      } else {
        that.needToDelet.push(index)
        that.setData({
          count: that.data.count -1,
          realCount: that.data.realCount - 1
        })
      }
    })

    //显示进度弹窗
    that.setData({
      uploadImg: true
    })

    logger.info('111......111', paths)
    app.cancelUpload = false
    that.increaseNum = 0 //初始化自然增量标识符
    // app.newUploadPhotos(app.checkBaseVersion('1.4.0'), paths, co.wrap(function *(index, url){ //index不是下标，是计数，从1开始

    app.uploadFiles(paths, co.wrap(function* (index, url) { //index不是下标，是计数，从1开始
      if(index && url){
        yield that.getImageOrientation(url)
      } else {
        if(app.cancelUpload){
          return
        }
        that.setData({
          count: 0,
          uploadImg: false,
          completeCount: 0
        })
        wx.showModal({
          title: '照片上传失败',
          content: '请检查网络或稍候再试',
          showCancel: false,
          confirmColor: '#ffe27a'
        })
      }
    }), function(progress){
      if(progress !== 'noPregress'){
        that.setData({
          percent: progress
        })
      }
    })
	}),

  cancelUpload: co.wrap(function *(){
    app.cancelUpload = true
    this.setData({
      uploadImg: false,
      count: 0,
      completeCount: 0
    })
    console.log('手动停止上传还可以继续上传张数：',this.data.countLimit)
  }),

  getImageOrientation: co.wrap(function *(url){
    logger.info('.......', url)
    let that = this
    let index = that.data.images.length
    let image = {
      count: 1,
      isSmallImage: false
    }
    that.data.images[index] = image

    that.setData({
      images: that.data.images,
      allCount: that.data.allCount + 1,
      completeCount: that.data.completeCount + 1
    })

    try{
      that.showImage(url, index)
    } catch(e){
      that.data.images.splice(that.data.images.length - 1, 1)
      that.setData({
        uploadImg: false,
        completeCount: 0,
        // 以下为删除信息获取失败图片所占数组、数量空间
        images: that.data.images,
        allCount: that.data.allCount - 1
      })
      wx.showModal({
        title: '照片上传失败',
        content: '请检查网络或',
        showCancel: false,
        confirmColor: '#ffe27a'
      })
    }
  }),

  showImage: co.wrap(function *(url, index){
    let that = this
    let noRotate = this.data.media_size[this.media_type].noRotateMin
    let imagePath = yield imginit.imgInit(url, 'vertical')
    let localUrl = imagePath.imgNetPath
    let imageInfo = imagePath.imageInfo
    that.increaseNum += 1
    //大图过滤
    if(imageInfo.width / imageInfo.height > 5 || imageInfo.height / imageInfo.width > 5){
      that.needToDelet.push(index)  //追加无效图片索引
      that.setData({
        realCount: that.data.realCount - 1
      })
    } else {
      let image = {
        url: imginit.addProcess(localUrl, noRotate),
        localUrl: localUrl,
        count: 1,
        width: imageInfo.width,
        height: imageInfo.height,
        isSmallImage: false
      }

      //小图标记
      if(imageInfo.width < 600 || imageInfo.height < 600){
        image.isSmallImage = true
      }

      that.data.images[index] = image
      that.setData({
        percent: 0,
        images: that.data.images
      })
    }
    //最后一张图片结束清空隐藏进度条
    if(that.increaseNum == that.data.chooseCount){
      var delay = 0
      that.setData({
        uploadImg: false,
        count: 0,
        completeCount: 0
      })
      if(that.needToDelet.length){
        delay = 2000
        var newImages = that.data.images.filter((item, index) => {
          return that.needToDelet.indexOf(index) == -1
        })
        that.setData({
          images: newImages,
          showInterceptModal: '您上传的照片过大，请重新上传'
        })
        that.needToDelet = []
      }
      setTimeout(() => {
        logger.info('图片处理结束，所有照片：', that.data.images)
        that.setStorage()
        that.setData({
          showInterceptModal: false
        })
        if (that.data.images.length > that.data.currentStartIndex) { //判断图片过滤后 无新图片不进行跳转
          that.toMoreEdit({currentTarget: {id: that.data.currentStartIndex, flag: true}}, delay)
        }
      })
    }
  }),

  uploadImg: co.wrap(function* (images) {
    // if (!app.openId) {
    //   yield this.loopGetOpenId()
    // }
    let params = {
      // openid: app.openId,
      urls: images,
      media_type: this.media_type,
      from: 'mini_app'
    }

    console.log('订单生成参数', params)
    this.setData({
      showConfirmModal: null,
    })
    this.longToast.toast({
      img: '../../images/loading.gif',
      title: '正在提交',
      duration: 0
    })
    try {
      const resp = yield request({
        url: app.apiServer + `/ec/v2/orders`,
        method: 'POST',
        dataType: 'json',
        data: params
      })
      console.log(resp)
      if (resp.data.code !== 0) {
        throw (resp.data)
      }

      this.longToast.toast()
      console.log('订单创建成功', resp)
      wx.redirectTo({
        url: `../finish/index?type=photo_doc&media_type=${this.media_type}&state=${resp.data.order.state}`
      })

    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  //图片存储至本地
  setStorage: function () {
    try {
      wx.setStorageSync(this.media_type, {
        media_type: this.media_type,
        images: this.data.images,
        allCount: this.data.images.length
      })
    } catch (e) {
      console.log('图片存储到本地失败')
    }
  },



  







})
