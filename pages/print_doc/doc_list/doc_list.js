// pages/print_doc/doc_list/doc_list.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const _ = require('../../../lib/underscore/we-underscore')
import commonRequest from '../../../utils/common_request.js'
import { getLogger } from '../../../utils/logger'
const logger = new getLogger('pages/print_doc/doc_list/doc_list')
import router from '../../../utils/nav'
import storage from '../../../utils/storage'
import { uploadDocs } from '../../../utils/upload'
import event from '../../../lib/event/event'
Page({
	data: {
		isFullScreen: false,
		allCount: 0, //上传总数
		type: null, //打印类型
		types: {},
		files: [], //文件列表
		checkboxFlag: false,
		confirmModal: {
			isShow: false,
			title: '请正确放置A4打印纸',
			image: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_confirm_print_a4_new.png'
		}
	},

	onLoad: co.wrap(function *(options){
		try {
			this.longToast = new app.weToast()
			var docFiles = JSON.parse(decodeURIComponent(options.arrayFile))
			var type = options.type || '' //打印类型
			this.getPrinterCapability() //获取打印能力数据

			if (type === 'baidu') {
				this.formatFiles(docFiles)
			} else {
				yield this.formatUpLoadFiles(docFiles)
			}
			this.setData({
				isFullScreen: app.isFullScreen,
				type,
				types: {
					printType: "_docA4",
					mediaType: "doc"
				},
				allCount: docFiles.length,
			})

			event.on('setPreData', this, (postData)=>{
				this.setPostData(postData)
			})
		} catch(err) {
			logger.error(err)
		}

	}),

	/**
	 * @methods 获取打印能力数据
	 */
	getPrinterCapability: co.wrap(function*(){
		this.initPms = {
			duplex: false, //单双面面
			copies: 1, // 份数
		}
		var resp = yield commonRequest.getPrinterCapacity('doc_a4') //获取打印能力数据
		
		this.initPms.duplex = resp.duplex
		this.initPms.grayscale = resp.grayscale
		this.initPms.color = resp.color
	}),

	formatFiles: function (docList) {
		try {
			var docFiles = docList.map(doc=>{
				return {
					originalUrl: doc.url,
					filename: doc.filename,
					grayscale: this.initPms.grayscale,
					colorCheck: currentFile.color ? true : false,
					color: this.initPms.color,
					duplex: this.initPms.duplex,
					copies: 1, //份数
					isSetting: false,
					singlePageLayoutsCount: 1
				}
			})
			this.setData({
				files: this.data.files.concat(docFiles) || []
			})
		} catch(err) {
			logger.info(err)
		}
	},

	// 格式化文档
	formatUpLoadFiles: co.wrap(function* (docList) {
		var copyDocFiles = _(docList).clone()
		var newDocFiles = util.clearFile(docList)
		if (!newDocFiles.length) {
			return this.longToast.toast({
				type:'info',
				title: '不支持打印的文件已为您过滤'
			})
		}

		if (copyDocFiles.length != newDocFiles.length) {
			this.setData({
				isCleared: false
			})
		}
		this.uploadMessageFile(newDocFiles)

	}),

	/**
	 * @methods 上传文档
	 */
	uploadMessageFile: co.wrap(function*(urls) {
    try {
			this.longToast.toast({
				type:'loading',
				title: '正在上传'
			})
			var _this = this
			var urlList = _(urls).clone()
			var uploadFileList = []
      yield uploadDocs(urls, function(url, name) {
        var file = {
					originalUrl: url,
          filename: name,
					grayscale: _this.initPms.grayscale,
					colorCheck:  _this.initPms.color ? true : false,
					color: _this.initPms.color,
          duplex: _this.initPms.duplex,
          copies: 1,
          isSetting: false,
          skipGs: true,
          extract: 'all',
          singlePageLayoutsCount: 1
        }
        if (url) {
          uploadFileList.push(file)
          var tempFiles = _(_this.data.files).clone()
					_this.setData({
						files: [...tempFiles, file]
					})
        }
        if (uploadFileList.length == urlList.length) {
          _this.setData({
            allCount: _this.data.allCount + uploadFileList.length,
          })
          if (_this.data.isCleared) {
						_this.longToast.toast({
							type:'info',
							title: '不支持打印的文件已为您过滤'
						})
						_this.setData({
							isCleared: false
						})
					}
					_this.longToast.hide()
        }
			}, true)

    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
	}),

	/**
	 * @methods 选择文档
	 */
	chooseDocFile: co.wrap(function *(){
		if (this.data.files.length >= 5) {
			return wx.showModal({
				content: '每次最多选择5个文档',
				confirmColor: '#FFDC5E',
				confirmText: "确认",
				showCancel: false
			})
		}
		this.selectComponent("#checkComponent").showPop()
	}),

	/**
	 * @methods 选择文档完成
	 */

	choosedDoc(res){
		let tempFiles = _(res.detail.tempFiles).clone(),
		newDocFiles = util.clearFile(res.detail.tempFiles)
		if (newDocFiles.length > 0) {
			return this.uploadMessageFile(newDocFiles)
		}

		if (tempFiles.length == 1) {
			_this.longToast.toast({
				type:'info',
				title: '不支持打印的文件已为您过滤'
			})
		}
	},

	/**
	 * @methods 确认
	 */
	confirm: co.wrap(function*(e) {
		// 判断是否授权手机号

		// 判断是否选择文档
    if (this.data.allCount == 0) {
       return wx.showModal({
        content: '至少选择一个文档打印',
        confirmColor: '#FFDC5E',
        confirmText: "确认",
        showCancel: false
      })
    }

    if(Boolean(storage.get("hideConfirmPrintBox"))){
        return this.print()
		}

		this.setData({
				['confirmModal.isShow']: true
		})
	}),

	/**
	 * @methods 打印
	 */
	print: co.wrap(function*() {
    try {
			this.longToast.toast({
				type:'loading',
				title: '正在提交',
				duration: 0
			})
			var urls = this.data.files.map(file => util.removeKeysToNewObj(file, ['isSetting', 'colorCheck']))
			console.log(urls,'==urls==')
			const resp = yield commonRequest.createOrder('doc_a4', urls)
			router.navigateTo('/pages/finish/index',
				{
					media_type: 'doc_a4',
					state: resp.createOrder.state
			})
    } catch (e) {
      util.showError(e)
    } finally {
			this.longToast.hide()
		}
	}),

	/**
	 * @methods 预览
	 */
	preview: co.wrap(function*(e) {
    try {
			if (app.preventMoreTap(e)) {
				return
			}
			var { originalUrl,  singlePageLayoutsCount, skipGs, extract } = this.data.files[parseInt(e.currentTarget.id)]
			this.longToast.toast({
				type:'loading',
				title: '正在开启预览',
				duration: 0
			})
			commonRequest.previewDocument({
				feature_key: 'doc_a4',
				worker_data: {url: originalUrl, display: singlePageLayoutsCount, skip_gs: skipGs, extract: (extract || 'all')}
			}, ()=>{
				this.longToast.hide()
			})
		} catch(err) {
			this.longToast.hide()
		}
	}),

	/**
	 * @methods 删除当前行文档
	 */
	delCurrentDoc: co.wrap(function*(e) {
		util.deleteItem(this.data.files, this.data.files[e.currentTarget.id])
    this.setData({
      files: this.data.files,
      allCount: this.data.allCount - 1
    })
	}),

	/**
	 * @methods 设置页面属性
	 */
	setting: co.wrap(function*(e) {
		try {
			if (app.preventMoreTap(e)) {
				return
			}

			var currentFile = this.data.files[e.currentTarget.id]
			var print_capability = yield commonRequest.getPrinterCapacity('doc_a4', currentFile.originalUrl) //获取打印能力
			if (!print_capability) {
				return
			}
			var postData = {
				page_count: print_capability.pageCount,
				name: currentFile.filename,
				fileIndex: e.currentTarget.id,
				color: print_capability.color,
				grayscale: print_capability.grayscale,
				duplex: print_capability.duplex,
				colorCheck: print_capability.color ? true : false,
				duplexCheck: false,
				isSetting: currentFile.isSetting,
				url: currentFile.originalUrl,
				skipGs: true
			}
			if (currentFile.isSetting) {
				postData.startPage = currentFile.startPage
				postData.colorCheck = currentFile.colorCheck
				postData.endPage = currentFile.endPage
				postData.copies = currentFile.copies
				postData.singlePageLayoutsCount = currentFile.singlePageLayoutsCount
				postData.skipGs = currentFile.skipGs
				postData.extract = currentFile.extract
			}
			router.navigateTo('/pages/print_doc/doc_setting/doc_setting',
				{
					postData: encodeURIComponent(JSON.stringify(postData)),
			})
		} catch (e) {
			this.longToast.hide()
			util.showError(e)
		}
	}),
	/**
	 * @methods设置回传参数
	 * @param {Object} postData
	 */
	setPostData: function(postData) {
		let tempFiles = _(this.data.files).clone()
		tempFiles[postData.fileIndex].copies = postData.copies
		tempFiles[postData.fileIndex].startPage = postData.startPage
		tempFiles[postData.fileIndex].skipGs = postData.skipGs
		tempFiles[postData.fileIndex].extract = postData.extract
		tempFiles[postData.fileIndex].endPage = postData.endPage
		tempFiles[postData.fileIndex].grayscale = !postData.colorCheck
		tempFiles[postData.fileIndex].color = postData.colorCheck
		tempFiles[postData.fileIndex].colorCheck = postData.colorCheck
		tempFiles[postData.fileIndex].duplex = postData.duplex
		tempFiles[postData.fileIndex].singlePageLayoutsCount = postData.singlePageLayoutsCount
		tempFiles[postData.fileIndex].isSetting = true
		this.setData({
			files: tempFiles
		})
	},
	baiduPrint(res){
		let baiduFiles = res.detail
		this.formatFiles(baiduFiles)
	},
	onUnload() {
		event.remove('setPreData', this)
	}
})
