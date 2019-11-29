// pages/print_doc/doc_list/doc_list.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
// const uploadFormId = require('../../../utils/gfd-formid-upload')

const showModal = util.promisify(wx.showModal)
const scanCode = util.promisify(wx.scanCode)
const _ = require('../../../lib/underscore/we-underscore')
import api from '../../../network/restful_request'
// import commonRequest from '../../../utils/common_request.js'
import { getLogger } from '../../../utils/logger'
const logger = new getLogger('pages/print_doc/doc_list/doc_list')
import router from '../../../utils/nav'
import storage from '../../../utils/storage'
Page({
	data: {
		allCount: 0, //上传总数
		type: null, //打印类型
		hasAuthPhoneNum: false, //是否授权手机号
		types: {},
		files: [], //文件列表
		showSecurityModal: false,
		checkboxFlag: false,
	},

	onLoad: co.wrap(function *(options){
		return
		try {
			this.longToast = new app.weToast()
			var docFiles = JSON.parse(decodeURIComponent(options.arrayFile))
			var type = options.type //打印类型
			this.getPrinterCapability() //获取打印能力数据

			if (['baidu', 'security'].indexOf(type) > -1) {
				this.formatFiles(docFiles)
			} else {
				yield this.formatUpLoadFiles(docFiles)
			}
			this.setData({
				type,
				types: type == 'security' ? {
					printType: "security_folder",
					mediaType: "security_folder"
				} : {
					printType: "_docA4",
					mediaType: "doc"
				},
				allCount: docFiles.length,
			})

		} catch(err) {
			logger(err).error()
		}

	}),

	onShow:function(){
		let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
		this.hasAuthPhoneNum = hasAuthPhoneNum
		this.setData({
			hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
		})
	},

	// 获取打印能力数据
	getPrinterCapability: co.wrap(function*(){
		this.initPms = {
			duplex: false, //单双面面
			number: 1, // 份数
		}
		var resp = yield commonRequest.getPrinterCapability() //获取打印能力数据
		this.initPms.color = resp && resp.color_modes[0] || 'Color'
	}),

	formatFiles: function (docList) {
		try {
			var docFiles = docList.map(doc=>{
				return {
					url: doc.url,
					filename: doc.filename,
					color: this.initPms.color,
					duplex: this.initPms.duplex,
					number: 1,
					isSetting: false,
					display: 1
				}
			})
			this.setData({
				docFiles: docFiles || []
			})
		} catch(err) {
			logger(err).error()
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

	// 上传文档
	uploadMessageFile: co.wrap(function*(urls) {
    try {
			this.longToast.toast({
				type:'loading',
				title: '正在上传',
				duration: 0
			})
			var _this = this
			var urlList = _(urls).clone()
			var uploadFiles = []
      yield app.uploadFile(urls, function(url, name) {
        var file = {
          url: url,
          filename: name,
          color: _this.initOption.color,
          duplex: _this.initOption.duplex,
          number: 1,
          isSetting: false,
          skip_gs: true,
          extract: 'all',
          display: 1
        }
        if (url) {
          uploadFiles.push(file)
          var tempFiles = _(_this.data.files).clone()
					_this.setData({
						files: [...tempFiles, file]
					})
        }
        if (uploadFiles.length == urlList.length) {
          _this.setData({
            allCount: _this.data.allCount + uploadFiles.length,
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
        }
			})
		
    } catch (e) {
      this.longToast.hide()
      util.showErr(e)
    }
	}),

	//选择文档 
	chooseDocFile: co.wrap(function *(){
		if (this.data.files.length >= 5) {
			return wx.showModal({
				content: '每次最多选择5个文档',
				confirmColor: '#2086ee',
				confirmText: "确认",
				showCancel: false
			})
		}
		var _this = this
		var leftLength = 5 - this.data.files.length
		wx.chooseMessageFile({
			type: 'file',
			count: leftLength, //暂定最多5个文档
			success: (res) => {
				var tempFiles = _(res.tempFiles).clone()
				var newDocFiles = util.clearFile(res.tempFiles)
				if (newDocFiles.length > 0) {
					return _this.uploadMessageFile(newDocFiles)
				} 
				
				if (tempFiles.length == 1) {
					_this.longToast.toast({
						type:'info',
						title: '不支持打印的文件已为您过滤'
					})
				}
				
			},
			fail: function() {
				util.showErr({
					message:'文件获取失败，请重试~'
				})
			}
		})
	}),

	//确认
	confirm: co.wrap(function*(e) {
		uploadFormId.dealFormIds(e.detail.formId, `print_docA4`)
		uploadFormId.upload()
		// 判断是否授权手机号
    if(!this.hasAuthPhoneNum && !app.hasPhoneNum){
      return
		}
		// 判断是否选择文档
    if (this.data.allCount == 0) {
       return wx.showModal({
        content: '至少选择一个文档打印',
        confirmColor: '#2086ee',
        confirmText: "确认",
        showCancel: false
      })
    }
		
    if(Boolean(wx.getStorageSync("hideConfirmPrintBox"))){
        return this.print()
		} 
		
		this.setData({
				['confirmModal.isShow']: true
		})
	}),
	
	// 获取手机号
	getPhoneNumber: co.wrap(function*(e){
		yield app.getPhoneNum(e)
		storage.put('hasAuthPhoneNum', true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.confirm(e)
	}),
	
	// 打印
	print: co.wrap(function*() {
    try {
			this.longToast.toast({
				type:'loading',
				title: '正在提交',
				duration: 0
			})
			var types = this.data.types
      var urls = this.data.files
      const resp = yield api.printInvoice(types.printType, urls)
      if (resp.code != 0) {
        throw (resp)
			}
			router.navigateTo('/pages/finish/index',
				{
					type: types.mediaType,
					state: resp.order.state
			})
    } catch (e) {
      util.showErr(e)
    } finally {
			this.longToast.hide()
		}
	}),
	
	// 预览
	preview: co.wrap(function*(e) {
    try {
			if (app.preventMoreTap(e)) {
				return
			}
			var { url,  display, skip_gs, extract} = this.data.files[parseInt(e.currentTarget.id)]
			yield commonRequest.previewDocument(url, display, skip_gs, (extract || 'all'))
		} catch(err) {
			
		}
	}),

	// 删除当前行文档
	close: co.wrap(function*(e) {
    util.deleteItem(this.data.files, this.data.files[e.currentTarget.id])
    this.setData({
      files: this.data.files,
      allCount: this.data.allCount - 1
    })
	}),

	// 设置页面属性
	setting: co.wrap(function*(e) {
		try {
			if (app.preventMoreTap(e)) {
				return
			}
			var currentFile = this.data.files[e.currentTarget.id]
			var print_capability = yield commonRequest.getPrinterCapability(currentFile.url) //获取打印能力
			if (!print_capability) {
				return
			}

			var postData = {
				page_count: print_capability.page_count,
				name: currentFile.filename,
				fileIndex: e.currentTarget.id,
				colorModes: print_capability.color_modes,
				media_sizes: print_capability.media_sizes,
				colorCheck: currentFile.color,
				duplexCheck: currentFile.duplex,
				isSetting: currentFile.isSetting,
				url: currentFile.url,
				skip_gs: true
			}
			if (currentFile.isSetting) {
				postData.start_page = currentFile.start_page
				postData.end_page = currentFile.end_page
				postData.number = currentFile.number
				postData.display = currentFile.display
				postData.skip_gs = currentFile.skip_gs
				postData.extract = currentFile.extract
			}

			router.navigateTo('/pages/print_doc/setting',
				{
					postData: encodeURIComponent(JSON.stringify(postData)),
			})
		} catch (e) {
			this.longToast.hide()
			util.showErr(e)
		}
	}),
	
	// 扫码打印
	toScan(){
		let hideSecurityModal = Boolean(storage.get('hideSecurityModal'))
		if (hideSecurityModal) {
			return this.scanPrint()
		} 
		this.setData({
			showSecurityModal: true
		})
	},

	scanPrint: co.wrap(function*(){
    this.cancelScan()
    let scanResult = yield scanCode(),
    pathArr = scanResult.path.split('scene=')[1].split('_'),
    id = pathArr[2],
    type = pathArr[1]==='ec' ? 'Ec::Printer' : 'EpDevice'
    yield this.selectedPrinter(id, type)
	}),
	
	cancelScan(){
    if (this.data.checkboxFlag) {
			storage.put('hideSecurityModal', true)
    }
    this.setData({
      showSecurityModal: false
    })
	},
	
	// 设置不再提示安全打印弹窗
	checkboxChange() {
		this.setData({
			checkboxFlag: !this.data.checkboxFlag
		})
	},

	selectedPrinter:co.wrap(function*(id, type){
    this.longToast.toast({
			type:'loading',
			title: '请稍等'
		})
    try {
      let resp = yield request({
        url: app.apiServer + `/boxapi/v2/printers/${id}/security_selected`,
        method: 'POST',
        dataType: 'json',
        data: {
          'openid': app.openId,
          'printer_type': type
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      this.print()
    } catch (error) {
			this.longToast.hide()
      util.showErr(error)
    }
	})

})