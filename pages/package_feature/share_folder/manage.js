// pages/error_book/pages/share_folder/manage.js
"use strict"
const app = getApp()
import api from '../../../network/restful_request.js'
import gql from '../../../network/graphql_request.js'
const regeneratorRuntime = require('../../../lib/co/runtime')
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import {
    co,
    util
} from '../../../utils/common_import'
import router from '../../../utils/nav'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        selectText: '全选',
        memberIds: [], //选中文件sn
        exitSaveModal: null
    },
    onLoad: function (options) {
        logger.info(options)
        this.longToast = new app.weToast()
        this.page = 1
        this.pageEnd = false
        this.setData({
            file_name: options.file_name,
            // documentList: common_util.decodeLongParams(options.documentList)
        })
        this.sn = options.sn
        this.firstUploadBaidu()
        this.getDocumentList()
    },

    //删除文件
    deleteDocument: co.wrap(function* () {
        logger.info('this.data.memberIds===', this.data.memberIds)
        if (this.data.memberIds.length == 0) {
            return
        }
        let params = {
            sn: this.sn,
            documentsSn: this.data.memberIds
        }
        this.longToast.toast({
            type: 'loading',
            duration: 0
        })
        try {
            const resp = yield gql.deleteDocument(params)
            this.longToast.hide()
            this.page = 1
            this.getDocumentList()
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }
    }),

    //获取文件列表
    getDocumentList: co.wrap(function* () {
        this.longToast.toast({
            img: 'loading',
            duration: 0
        })
        if (this.page == 1) {
            this.setData({
                documentList: []
            })
            this.pageEnd = false
        }
        try {
            const resp = yield gql.getDocuments(this.sn, this.page)

            var pages = getCurrentPages()
            var prepage = pages[pages.length - 2]
            prepage.setData({
                documentList: resp.documents
            })
            this.longToast.toast()

            if (resp.documents.length < 20) {
                this.pageEnd = true
            }
            if (resp.documents.length == 0) {
                return
            }
            this.setData({
                documentList: this.data.documentList.concat(resp.documents),
            })
            if (this.data.selectText == '取消') {
                logger.info("zzzzzz")
                this.data.memberIds = []
                for (var i = 0; i < this.data.documentList.length; i++) {
                    this.data.documentList[i].choose = true,
                        this.data.memberIds.push(this.data.documentList[i].sn)
                }
                this.setData({
                    documentList: this.data.documentList
                })
            }
            logger.info("22222", this.data.documentList)
            this.page++

        } catch (e) {
            logger.info(e)
            this.longToast.toast()
            util.showError(e)
        }
    }),

    onReachBottom: function () {
        logger.info('分页加载')
        logger.info('this.pageEnd', this.pageEnd)
        if (this.pageEnd) {
            return
        }
        this.getDocumentList()
    },

    cancelExit: co.wrap(function* () {
        this.setData({
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
        wx.setStorageSync('firstCreatorBaidu', 1)
        this.uploadBaidu()
    },

    firstUploadBaidu: function () {
        let firstUploadBaidu = wx.getStorageSync('firstCreatorBaidu')
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
            let resp = yield gql.checkBaiduAuth()
            logger.info(resp)
            if (resp.token.baiduTokenName != null) {
                let params={
                    sn:this.sn,
                    documentSns:this.data.memberIds
                }
                this.longToast.toast({
                    type: 'loading',
                    duration: 0
                })
                try {
                    const resp = yield gql.uploadBaidu(params)
                    this.longToast.toast()
                    logger.info('上传百度云', resp)
                    wx.showToast({
                        title: '百度云的存储路径是：我的硬件数据/小白智慧打印',
                        icon: 'none',
                        mask: true,
                        duration: 2000
                    })
                    setTimeout(function () {
                        router.navigateBack()
                    }, 2000)
                } catch (e) {
                    this.longToast.hide()
                    util.showError(e)
                }
            } else {
                router.navigateTo('/pages/print_doc/start_intro/start_intro', {
                    type: 'baiduPrint'
                })
            }
        } catch (error) {
            util.showError(error)
        }
    }),

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
        if (this.data.memberIds.length == this.data.documentList.length) {
            logger.info("11111")
            this.setData({
                selectText: '取消'
            })
        } else {
            logger.info("2222")
            this.setData({
                selectText: '全选'
            })
        }
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
})