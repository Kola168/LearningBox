"use strict"
const app = getApp()
import api from '../../../network/restful_request.js'
import gql from '../../../network/graphql_request.js'
import upload from '../../../utils/upload.js'
const regeneratorRuntime = require('../../../lib/co/runtime')
const downloadFile = util.promisify(wx.downloadFile)
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

import {
	co,
	util,
	common_util,
	_
} from '../../../utils/common_import'
const imginit = require('../../../utils/imginit')
var imgInit = imginit.imgInit
import router from '../../../utils/nav'

const event = require('../../../lib/event/event')
const getFileInfo = util.promisify(wx.getFileInfo)
const getImageInfo = util.promisify(wx.getImageInfo)
const showModal = util.promisify(wx.showModal)
const MAXSIZE = 20000000;
const PAGE_COUNT = 20;
import commonRequest from '../../../utils/common_request.js'
import chooseImgWay from '../../../utils/showActionImg';
Page({
	data: {
		file_name: '11',
		uploadModel: false, //上传文件弹窗
		changeFileModal: false, //文件夹改名弹窗
		memberIds: [], //选中文件sn
		selectText: '全选',
		exitSharingModal: null, //退出共享弹窗
		showBaidu: false, //使用者点击转存百度云
		percent: 0,
		showupLoad: false, //progress 状态
		maxFileCount: 200, //最大数量
		completeCount: 0, //一次递加上传完成数量
		currentChooseCount: 0, // 一次选择数量
		totalCount: 0, //总数量
		imageList: [], //图片列表
		fileList: [], //文件列表
		originImages: null,
		images: null,
		upKey: null,
		capabilityInfo: null, //文件打印能力信息
		backHome: false,
		showShareModel: false,
		ballScroll: false,
		documentList: [],
		exitSaveModal: null, //转存百度云提示
		iosModal: false,
		text: '文件存储数量已用完，升级会员后存储数量不限'

	},

	onLoad: co.wrap(function* (options) {
		try {
			logger.info(options)
			this.longToast = new app.weToast()
			this.page = 1
			this.pageEnd = false
			this.firstShare()
			this.firstUploadBaidu()
			this.setData({
				file_name: options.file_name,
				role: options.role,
				time: options.time ? options.time : ''
			})
			this.sn = options.sn
			this.role = options.role
			this.users_count = options.users_count
			this.shareUserSn = options.userSn ? options.userSn : ''
			this.share = options.share ? options.share : ''
			if (this.share) {
				this.setData({
					backHome: true
				})
			}
			let userSn = wx.getStorageSync('userSn')
			if (userSn) {
				this.joinAndGetList()
			}
			event.on('Authorize', this, function (data) {
				this.joinAndGetList()
			})
		} catch (e) {
			logger.info(e)
		}
	}),

	okEvent: function (e) {
		logger.info(e)
		this.setData({
			ballScroll: e.detail.ballScroll
		})
	},
	//选择图片
	showImgCheck: function () {
		let maxFileCount = this.data.maxFileCount;
		let totalCount = this.data.totalCount;
		let every = 9
		// if (this.number == 0) {
		// 	return this.setData({
		// 		iosModal: true,
		// 	})
		// }
		// if (this.number < 9) {
		// 	every = this.number
		// }
		// logger.info(this.number)
		let restCount = Math.min(every, Math.max((maxFileCount - totalCount), 0))
		let count = restCount > 9 ? 9 : restCount
		if (restCount <= 0) {
			return
		}
		this.setData({
			chooseCount: count
		})
		this.selectComponent("#checkComponent").showPop()
	},

	joinAndGetList: co.wrap(function* () {
		if (this.share == 'true' && this.users_count < 200) {
			if (this.userSn == this.shareUserSn) {
				this.role = 'creator'
				this.setData({
					role: 'creator'
				})
				yield this.getDocumentList()
			} else {
				this.role = 'user'
				this.setData({
					role: 'user'
				})
				yield this.enterFile()
			}
		} else if (this.share == 'true' && this.users_count >= 200) {
			wx.showToast({
				title: '抱歉，成员人数已满，请及时联系分享人',
				icon: 'none',
				mask: true,
				duration: 2000
			})
		} else {
			this.getDocumentList()
		}
	}),

	onShow: co.wrap(function* (options) {
		let userSn = wx.getStorageSync('userSn')
		logger.info('应用参数传参', userSn, this.shareUserSn)
		if (!userSn) {
			logger.info('执行到文件夹授权===========')
			let url = this.shareUserSn ? `/pages/authorize/index?url=${url}&share_user_sn=${this.shareUserSn}` : `/pages/authorize/index`
			wx.navigateTo({
				url: url,
			})
		}
	}),

	backToHome: function () {
		wx.redirectTo({
			url: `/pages/error_book/pages/share_folder/index?tabId=1`,
		})
	},

	showShare: function (e) {
		this.setData({
			showShareModel: true,
		})
		wx.setStorageSync('firstTouch', '1')
		this.firstShare()
	},

	firstShare: function () {
		let firstTouch = wx.getStorageSync('firstTouch')
		logger.info('firstTouch', firstTouch)
		if (firstTouch) {
			this.setData({
				firstShare: true
			})
		} else {
			this.setData({
				firstShare: false
			})
		}
	},

	cancelShare: function () {
		this.setData({
			showShareModel: false
		})
	},

	cancelBaidu: function () {
		for (var i = 0; i < this.data.documentList.length; i++) {
			this.data.documentList[i].choose = false
			this.deleteOneId(this.data.memberIds, this.data.documentList[i].sn)
		}
		this.setData({
			documentList: this.data.documentList,
			showBaidu: false,
			memberIds: []
		})
	},

	//加入文件夹
	enterFile: co.wrap(function* () {
		this.longToast.toast({
			type: 'loading',
			duration: 0
		})
		try {
			const resp = yield gql.joinFolder({
				sn: this.sn
			})
			logger.info(this.sn, resp)
			logger.info('加入文件夹', resp)
			this.longToast.toast()
			var that = this
			that.getDocumentList()
			setTimeout(function () {
				wx.showToast({
					title: '成功加入此文件夹',
					icon: 'none',
					mask: true,
					duration: 2000
				})
			}, 300)

			// if (resp.code == 10017) { //文件夹被删除
			// 	this.longToast.toast()
			// 	throw (resp)
			// } else if (resp.code == 0) { //首次加入文件夹
			// this.longToast.toast()
			// var that = this
			// that.getDocumentList()
			// setTimeout(function () {
			// 	wx.showToast({
			// 		title: '成功加入此文件夹',
			// 		icon: 'none',
			// 		mask: true,
			// 		duration: 2000
			// 	})
			// }, 300)
			// } else if (resp.code == 10018) { //重复加入文件夹
			// 	logger.info("1111")
			// 	this.longToast.toast()
			// 	this.getDocumentList()
			// } else {
			// 	this.longToast.toast()
			// 	throw (resp)
			// }
		} catch (e) {
			this.longToast.hide()
			util.showError(e)
		}
	}),

	//存储文件
	uploadDocuments: co.wrap(function* (files = []) {
		logger.info('存储文件', files)
		this.longToast.toast({
			type: 'loading',
			duration: 0
		})
		let params = {
			sn: this.sn,
			documents: files
		}
		try {
			const resp = yield gql.createDocument(params)
			this.page = 1
			yield this.getDocumentList()
			logger.info('存储文件成功', resp)
			this.longToast.toast()
		} catch (e) {
			this.longToast.toast()
			logger.info(e)
			if (e.errors[0].extensions.code == 80000) {
				return this.setData({
					iosModal: true,
				})
			}
			util.showGraphqlErr(e)
		}
	}),

	//获取文件列表
	getDocumentList: co.wrap(function* () {
		this.longToast.toast({
			type: 'loading',
			duration: 0
		})

		this.pageEnd = false
		if (this.page === 1) {
			this.setData({
				documentList: []
			})
		}
		logger.info(app.openId, this.sn, this.role, this.page)
		try {
			const resp = yield gql.getDocuments(this.sn, this.page)

			logger.info('获取文件列表成功', resp)
			this.longToast.toast()
			// this.number = resp.documents.number //非会员每日限制次数

			if (resp.documents.length == 0) {
				return
			}

			var apiList = []
			if (Array.isArray(resp.documents)) {
				apiList = resp.documents
			}
			if (apiList.length < PAGE_COUNT) {
				this.pageEnd = true
			}

			this.setData({
				documentList: this.data.documentList.concat(apiList),
			})
			logger.info("22222", this.data.documentList)
			for (var i = 0; i < this.data.documentList.length; i++) {
				this.data.documentList[i].file_type = this.data.documentList[i].file_type.toLowerCase()
				this.setData({
					documentList: this.data.documentList
				})
			}
		} catch (e) {
			this.longToast.toast()
			util.showError(e)
		}
	}),

	onReachBottom: function () {
		logger.info("00000000000", this.page)
		logger.info('this.pageEnd', this.pageEnd)
		if (this.pageEnd)
			return
		this.page++
		this.getDocumentList()

	},

	newDocument: function () {
		this.setData({
			uploadModel: true
		})
	},

	cancelUpload: function () {
		this.setData({
			uploadModel: false
		})
	},

	manageDocument: function () {
		logger.info(common_util)
		wx.navigateTo({
			url: `manage?file_name=${this.data.file_name}&sn=${this.sn}&documentList=${common_util.encodeLongParams(this.data.documentList)}`,
		})
	},

	selectAll: co.wrap(function* (e) {
		this.setData({
			selectText: this.data.selectText === '全选' ? '取消' : '全选'
		})
		if (this.data.selectText === '取消') {
			this.data.memberIds = []
			for (var i = 0; i < this.data.documentList.length; i++) {
				this.data.documentList[i].choose = true,
					this.data.memberIds.push(this.data.documentList[i].sn)
			}
		} else {
			for (var i = 0; i < this.data.documentList.length; i++) {
				logger.info("qqqq", i, this.data.documentList.length)
				this.data.documentList[i].choose = false
				logger.info("aaa", this.data.documentList[i])
				this.deleteOneId(this.data.memberIds, this.data.documentList[i].sn)
			}
		}
		this.setData({
			documentList: this.data.documentList
		})
	}),

	choose: co.wrap(function* (e) {
		logger.info('e.currentTarget.id======', e.currentTarget.id)
		if (!this.data.documentList[parseInt(e.currentTarget.id)].choose) { //选中
			this.data.memberIds.push(this.data.documentList[parseInt(e.currentTarget.id)].sn)
		} else {
			this.deleteOneId(this.data.memberIds, this.data.documentList[parseInt(e.currentTarget.id)].sn)
		}
		this.data.documentList[parseInt(e.currentTarget.id)].choose = !this.data.documentList[parseInt(e.currentTarget.id)].choose
		logger.info('this.data.documentList=====', this.data.documentList)
		this.setData({
			documentList: this.data.documentList
		})
	}),


	deleteOneId: function (array, item) {
		logger.info('这里333333333333')
		Array.prototype.indexOf = function (val) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == val) return i;
			}
			return -1;
		};
		Array.prototype.remove = function (val) {
			var index = this.indexOf(val);
			if (index > -1) {
				this.splice(index, 1);
			}
		};
		return array.remove(item)
	},

	exitSharing: co.wrap(function* () {
		this.setData({
			exitSharingModal: {
				title: `退出后将无法查看到此文件夹中的所有资料`,
				bottom: `确认退出`
				// title: `文件夹中的所有资料`
			}
		})
	}),

	confirmExit: co.wrap(function* () {
		this.longToast.toast({
			type: 'loading',
			duration: 0
		})
		try {
			const resp = yield api.exitFolderShare(app.openId, this.sn)
			if (resp.code != 0) {
				throw (resp)
			}
			this.longToast.toast()
			logger.info('退出分享成功', resp.data)
			wx.showToast({
				title: '退出成功',
				icon: 'none',
				mask: true,
				duration: 1500
			})
			var that = this
			setTimeout(function () {
				if (that.data.role == 'user') {
					logger.info("22222");
					wx.redirectTo({
						url: `/pages/error_book/pages/share_folder/index?tabId=1`,
					})
				} else {
					logger.info("11111");
				}
			}, 1000)
		} catch (e) {
			this.longToast.toast()
			util.showError(e)
		}
	}),

	cancelExit: co.wrap(function* () {
		this.setData({
			exitSharingModal: null,
			exitSaveModal: null
		})
	}),

	showBaiduModal: function () {
		this.setData({
			exitSaveModal: {
				title: `转存百度网盘须知`,
				content: `由于文件存在安全问题转存至百度网盘的时间会有延迟，可40分钟后进入网盘查看`,
				role: `转存路径：我的硬件数据/小白智慧打印`,
				confirm: `确认`
			}
		})
	},

	confirmSave: function () {
		wx.setStorageSync('firstUserBaidu', 1)
		this.uploadBaidu()
	},

	firstUploadBaidu: function () {
		let firstUploadBaidu = wx.getStorageSync('firstUserBaidu')
		if (firstUploadBaidu) {
			this.setData({
				firstUploadBaidu: true
			})
		} else {
			this.setData({
				firstUploadBaidu: false
			})
		}
	},

	uploadBaidu: co.wrap(function* () {
		this.firstUploadBaidu()
		if (this.data.memberIds.length == 0) {
			return
		}
		try {
			let resp = yield api.checkBaiduAuth(app.openId)
			logger.info(resp)
			if (resp.code == 0) {
				this.longToast.toast({
					type: 'loading',
					duration: 0
				})
				try {
					const resp = yield api.uploadBaidu(app.openId, this.data.memberIds)
					if (resp.code != 0) {
						throw (resp)
					}
					this.longToast.toast()
					logger.info('上传百度云', resp.data)
					wx.showToast({
						title: '百度云的存储路径是：我的硬件数据/小白智慧打印',
						icon: 'none',
						mask: true,
						duration: 2000
					})
					let that = this
					setTimeout(function () {
						for (var i = 0; i < that.data.documentList.length; i++) {
							that.data.documentList[i].choose = false
							that.deleteOneId(that.data.memberIds, that.data.documentList[i].sn)
						}
						that.setData({
							documentList: that.data.documentList,
							showBaidu: false,
							memberIds: []
						})
					}, 2000)
				} catch (e) {
					this.longToast.toast()
					util.showError(e)
				}
			} else {
				wx.navigateTo({
					url: `../../../print_doc/start_intro?type=baiduPrint`
				})
			}
		} catch (error) {
			util.showError(error)
		}
	}),

	toBaidu: co.wrap(function* () {
		this.setData({
			showBaidu: true
		})
	}),

	toPreview: co.wrap(function* (e) {
		if (this.data.documentList[e.currentTarget.id].file_type == 'image') {
			let arr = []
			arr.push(this.data.documentList[e.currentTarget.id].url)
			logger.info("arr====", arr)
			wx.previewImage({
				current: '',
				urls: arr
			})
		} else {
			yield commonRequest.previewDocument(this.data.documentList[e.currentTarget.id].url)
		}
	}),

	onShareAppMessage: function (e) {
		// let userId = wx.getStorageSync("userId")
		// logger.info("aaaaaaaa----", userId)
		return {
			title: `这些资料很不错哦，点击加入${this.data.file_name}`,
			path: `/pages/error_book/pages/share_folder/content?sn=${this.sn}&file_name=${this.data.file_name}&share=true&users_count=${this.users_count}&userId=${userId}`,
			imageUrl: `../../images/folder_share_img.jpg`
		}
	},
	// 选择文件
	chooseFiles: co.wrap(function* () {
		try {
			const {
				SDKVersion
			} = wx.getSystemInfoSync()
			let every = 5
			// if (this.number == 0) {
			// 	return this.setData({
			// 		iosModal: true,
			// 	})
			// }
			// if (this.number < 5) {
			// 	every = this.number
			// }
			// logger.info(this.number)
			const count = Math.min(Math.max(this.data.maxFileCount - this.data.totalCount, 0), every)
			if (count <= 0) {
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
						logger.info('res.tempFiles', res.tempFiles)
						this.utilsMessageFiles(res.tempFiles);
					},
					fail: () => {
						logger.info('选取文件失败')
						util.showError({
							message: '文件获取失败，请重试~'
						})
					},
					complete: () => {
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
	utilsMessageFiles: co.wrap(function* (tempFilesList) {
		let tempFiles = _(tempFilesList).clone()
		let newFiles = util.clearFile(tempFiles) //检查文件格式
		if (!newFiles.length) {
			return wx.showModal({
				title: '提示',
				content: '上传文件为空，请重新选择',
				confirmColor: '#2086ee',
				confirmText: "确认",
				showCancel: false
			})
		}
		this.setData({
			upKey: 'file'
		})
		newFiles = yield this.checkFileSize(newFiles)
		yield this.initProgressStatus(newFiles) //初始化进度条
		const isFile = true;
		const filesList = yield this.syncLoadFiles(newFiles, tempFilesList, 'files', isFile)

		filesList && filesList.forEach(file => {

			this.setData({
				[`fileList[${this.data.fileList.length}]`]: {
					key: 'files',
					files: file
				}
			})
		})
		this.uploadDocuments(filesList)
	}),
	baiduImage: co.wrap(function* (e) {
		logger.info(e)
		let paths = e.detail
		let urls = []
		let that = this
		paths.forEach(co.wrap(function* (data, index) {
			try {
				let u = yield downloadFile({
					url: data.url
				})
				urls.push({
					path: u.tempFilePath
				})
				if (index == paths.length - 1) {
					e = {
						detail: {
							tempFiles: urls
						}
					}
					that.chooseImgs(e)
				}
			} catch (e) {}

		}))

	}),
	// 选择图片
	chooseImgs: co.wrap(function* (e) {
		try {
			// 	this.setData({
			// 		upKey: 'pic'
			// 	})
			// let _this = this;
			// let maxFileCount = this.data.maxFileCount;
			// let totalCount = this.data.totalCount;
			// let every = 9
			// if (this.number == 0) {
			// 	return this.setData({
			// 		iosModal: true,
			// 	})
			// }
			// if (this.number < 9) {
			// 	every = this.number
			// }
			// 	logger.info(this.number)
			// 	const limit = Math.min(every, Math.max((maxFileCount - totalCount), 0))
			// 	const imgs = yield chooseImgWay(limit); //选择上传文件方式

			let imgs = e.detail.tempFiles
			logger.info('234567890-=-0987654323456789', imgs)
			this.uploadImage(imgs)
		} catch (err) {
			logger.info(err)
		}

	}),
	uploadImage: co.wrap(function* (imgs) {
		let newImages = yield this.checkImgSize(imgs) //检测文件格式
		yield this.initProgressStatus(newImages) //初始化进度条
		const imageList = yield this.syncLoadFiles(newImages, imgs) //并行上传
		logger.info(imageList, '====imageList====')
		let _this = this
		imageList && imageList.forEach(img => {
			_this.setData({
				[`fileList[${_this.data.fileList.length}]`]: {
					fileType: 'image',
					url: img,
					name: '图片'
				}
			})
		})
		this.uploadDocuments(imageList)
	}),
	// 检验图片尺寸
	checkImgSize: function (images) {
		let newImages = []
		return new Promise((resolve, reject) => {
			try {
				images.length && images.forEach(co.wrap(function* (image, index) {
					let path = (typeof image == 'string') ? image : image.path; // 微信文件时为object
					let imageInfo = yield getImageInfo({
						src: path
					});
					const files = yield getFileInfo({
						filePath: path
					})
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
	checkFileSize: function (files) {
		let newFiles = [],
			filterFiles = [];
		return new Promise((resolve, reject) => {
			try {
				files.length && files.forEach(co.wrap(function* (file, index) {
					const filesInfo = yield getFileInfo({
						filePath: file.path
					})
					// 过滤正确情况下进行上传
					const codition1 = (filesInfo && filesInfo.size > MAXSIZE); // 微信文件判断 size > 20000000
					if (!codition1) {
						newFiles.push(file)
					} else {
						filterFiles.push(file)
					}
					if (filterFiles.length + newFiles.length == files.length) {
						resolve(newFiles)
					}

				}))
			} catch (err) {
				reject(err)
			}
		})
	},
	upLoadFiles: function (paths, getProgress, uploadKey, isFile = false, isFolder = true) {
		try {
			const newPaths = !isFile && typeof paths === 'object' ? paths.path : paths; //区分选择文件上传和普通上传的格式区分
			return new Promise((resolve, reject) => {
				upload.uploadFiles([newPaths], (index, url) => {
					logger.info('===url====', url)
					if (index !== '' && url !== '') { //上传完成
						resolve({
							url: url
						})
					} else if (app.cancelUpload) { //手动停止
						resolve(false)
					} else { // 上传异常
						resolve(false)
					}
				}, getProgress, isFile, uploadKey, isFolder)
			})
		} catch (err) {
			logger.info(err)
		}
	},
	// 并行上传图片、文件 | 过滤处理
	syncLoadFiles: co.wrap(function* (newFiles, originFiles, type = 'image', isFile) {
		let _this = this;
		let successTask = [],
			errTask = [];
		return new Promise((resolve, reject) => {
			try {
				let newCloneFiles = _(newFiles).clone()
				if (newCloneFiles.length && this.data.showupLoad) {
					newCloneFiles.forEach(co.wrap(function* (currentFile) {
						let newLoadFile = yield _this.upLoadFiles(currentFile, _this.loadProgress, _this.sn, isFile) //图片上传
						yield _this.resetProgress(newCloneFiles) //清除重置进度数
						yield _this.updateProgressStatus(originFiles, newCloneFiles) //上传完成后处理
						if (newLoadFile) { //是否成功上传数据
							newLoadFile = yield _this.joinFiles(newLoadFile, type, currentFile) //组织不同数据格式
							successTask.push(newLoadFile) // 追加有效文件
						} else {
							errTask.push([]) //追加异常数量
						}
						const mainTask = [].concat(successTask, errTask); //合并

						if (mainTask.length === newCloneFiles.length) { // 上传完成 last times
							resolve(successTask) //返回成功上传的有效数据
						}
					}))

				} else {
					this.updateProgressStatus(originFiles, newCloneFiles)
					resolve([])
				}
			} catch (err) {
				wx.showModal({
					title: '上传失败',
					content: '网络异常,请检查网络是否稳定后再次上传',
					showCancel: false,
					confirmColor: '#FFE27A'
				})
				console.error(err)
			}
		})

	}),
	joinFiles: function (newLoadFile, type, currentFile) {
		try {
			let _this = this;
			return new Promise(co.wrap(function* (resolve, reject) {
				if (type === 'image') { // 类型为图片类型
					newLoadFile = {
						...newLoadFile,
						name: '图片',
						fileType: 'image'
					}
				} else { //文件类型切换格式

					const name = currentFile.name.substr(0, currentFile.name.lastIndexOf('.'))
					const types = currentFile.name.substr(currentFile.name.lastIndexOf('.') + 1, currentFile.name.length).toLowerCase()
					logger.info(name, 'name', type, 'type')
					newLoadFile = {
						...newLoadFile,
						name: name,
						fileType: types
					}
				}
				logger.info(newLoadFile, 'newLoadFile')
				resolve(newLoadFile)
			}))
		} catch (err) {
			logger.info(err)
		}
	},
	// 处理不同数据格式
	accordFiles: function (newLoadFile, type, currentFile) {
		try {
			let _this = this;
			return new Promise(co.wrap(function* (resolve, reject) {
				if (type === 'image') { // 类型为图片类型
					newLoadFile = yield _this.resetImg(newLoadFile) //格式化图片
				} else { //文件类型切换格式
					newLoadFile = Object.assign(newLoadFile, {
						filename: currentFile.name + '.' + currentFile.file_type,
						number: 1,
						display: 1
					})
				}
				resolve(newLoadFile)
			}))
		} catch (err) {
			logger.info(err)
		}
	},
	// 初始化进度条状态
	initProgressStatus: co.wrap(function* (tempList) {
		app.cancelUpload = false //取消上传状态消除
		this.setData({
			currentChooseCount: tempList.length,
			completeCount: 0, //清空上次上传完成数量
			showupLoad: true
		})
	}),
	// 重置进度数
	resetProgress: co.wrap(function* (tempList) {
		let completeCount = tempList.length ? this.data.completeCount + 1 : this.data.completeCount; //判断可上传图片是否 > 1
		this.setData({
			completeCount: completeCount, //单词上传完成的已完成的数量
			percent: 0, // 单个进度数重置
		})
	}),
	// 更新上传后状态
	updateProgressStatus: co.wrap(function* (originTempList, tempList) {
		let originTempListLen = originTempList.length;
		let tempListLen = tempList.length;
		let {
			currentChooseCount,
			completeCount
		} = this.data;
		let totalCount = this.data.totalCount = tempList.length ? this.data.totalCount + 1 : this.data.totalCount; //判断可上传图片是否 > 1

		clearTimeout(this.timer)
		this.timer = setTimeout(() => {
			// 进度条状态处理
			this.setData({
				totalCount: totalCount,
			})
			if (completeCount === currentChooseCount) {
				this.setData({
					showupLoad: false,
				})
			}
			// 上传完成进行筛选过滤提示
			if (completeCount === currentChooseCount && originTempListLen > tempListLen) {
				wx.showToast({
					title: `有${originTempListLen - tempListLen}个文件过大无法上传`,
					icon: 'none',
					duration: 2500,
					mask: true,
				})
			}
		}, 100)
	}),
	// 图片格式化
	resetImg: co.wrap(function* ({
		url
	}) {
		let origin_url = url; //未加后缀原图
		// 处理华为云方式
		if (util.isHuaweiCloud(url)) {
			let imaPath = yield imgInit(url, 'vertical')
			return {
				url: imaPath.imgNetPath,
				origin_url: origin_url,
				width: imaPath.imageInfo.width,
				height: imaPath.imageInfo.height
			}
		}
		// 兼容阿里云
		let baseVersion = '1.9.90'; //基础版本号
		let imageInfo = null;
		imageInfo = yield getImageInfo({
			src: url
		})

		if (['left', 'right'].indexOf(imageInfo.orientation) > -1) {
			imageInfo.orientation = true
		} else {
			imageInfo.orientation = false
		}

		let rotateLimit = '?x-oss-process=image/auto-orient,1/rotate,90';
		let noRotate = '?x-oss-process=image/auto-orient,1';
		let orientation = false;
		let flag = 0
		if (imageInfo.orientation) {
			//带旋转信息的横图
			if (imageInfo.width < imageInfo.height) {
				orientation = true
				url = url + rotateLimit
				flag = 1
			} else {
				let width = imageInfo.width;
				imageInfo.width = imageInfo.height;
				imageInfo.height = width;
				url = url + noRotate
				orientation = false
				flag = 1
			}
		} else {
			//不带横向旋转信息
			if (imageInfo.width > imageInfo.height) {
				let width = imageInfo.width;
				imageInfo.width = imageInfo.height;
				imageInfo.height = width;
				url = url + rotateLimit
				orientation = true
			} else {
				url = url + noRotate //竖图
				orientation = false
			}
		}
		return {
			url: url,
			origin_url: origin_url,
			orientation: orientation,
			width: imageInfo.width,
			height: imageInfo.height,
			flag: flag
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
	toPrint: co.wrap(function* (e) {
		this.longToast.toast({
			type: 'loading',
			duration: 0
		})
		const {
			index
		} = e.currentTarget.dataset
		const currentData = this.data.documentList[index];
		const key = currentData.file_type
		const url = currentData.url
		const printData = yield this.accordFiles({
			url: url
		}, key, currentData)
		let routerUrl = null;
		logger.info(printData, '==printData===')
		switch (key) {
			case 'image':
				router.navigateTo('/pages/package_feature/share_folder/photo_preview/preview', {
					image: encodeURIComponent(JSON.stringify(printData))
				})
				break;
			default:
				let postData = {
					name: printData.filename,
					number: 1,
					url: printData.url
				}
				router.navigateTo('/pages/package_feature/share_folder/setting/index', {
					files: encodeURIComponent(JSON.stringify(postData))
				})
		}
		this.longToast.hide()
	}),
	cancel: function () {
		app.cancelUpload = true //手动取消上传
		this.setData({
			showupLoad: false, //关闭弹窗
		})
	},
	onUnload: function () {
		event.remove('Authorize', this)
	}

})