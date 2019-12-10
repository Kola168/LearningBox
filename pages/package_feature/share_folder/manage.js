// pages/error_book/pages/share_folder/manage.js
"use strict"
const app = getApp()

import api from '../../../network/restful_request.js'
// import graphql from '../../../network/graphql_request.js'
const regeneratorRuntime = require('../../../lib/co/runtime')
import {
    co,
    util
} from '../../../utils/common_import'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        selectText: '全选',
        memberIds: [], //选中文件sn
        exitSaveModal:null
    },
    onLoad: function(options) {
        console.log(options)
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
    deleteDocument: co.wrap(function*() {
        console.log('this.data.memberIds===', this.data.memberIds)
        if (this.data.memberIds.length == 0) {
            return
        }
        this.longToast.toast({
            img: 'loading',
            duration: 0
        })
        try {
            const resp = yield api.deleteDocument(app.openId, this.sn, this.data.memberIds)
            if (resp.code != 0) {
                throw (resp)
            }
            this.longToast.toast()
            console.log('删除文件成功', resp.data)
            //刷新
            this.page = 1
            this.getDocumentList()

        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }
    }),

    //获取文件列表
    getDocumentList: co.wrap(function*() {
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
        console.log(app.openId, this.sn, 'creator', this.page)
        try {
            const resp = yield api.getDocumentsList(app.openId, this.sn, 'creator', this.page)
            if (resp.code != 0) {
                throw (resp)
            }
            console.log('获取文件列表成功', resp)
            var pages = getCurrentPages()
            var prepage = pages[pages.length - 2]
            prepage.setData({
                documentList: resp.res
            })
            this.longToast.toast()

            if (resp.res.length < 20) {
                this.pageEnd = true
            }
            if (resp.res.length == 0) {
                return
            }
            this.setData({
                documentList: this.data.documentList.concat(resp.res),
            })
            if (this.data.selectText == '取消') {
                console.log("zzzzzz")
                this.data.memberIds = []
                for (var i = 0; i < this.data.documentList.length; i++) {
                    this.data.documentList[i].choose = true,
                        this.data.memberIds.push(this.data.documentList[i].sn)
                }
                this.setData({
                    documentList: this.data.documentList
                })
            }
            console.log("22222", this.data.documentList)
            this.page++

        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }
    }),

    onReachBottom: function() {
        console.log('分页加载')
        console.log('this.pageEnd', this.pageEnd)
        if (this.pageEnd) {
            return
        }
        this.getDocumentList()
    },

    cancelExit: co.wrap(function* () {
        this.setData({
            exitSaveModal:null
        })
    }),

    showBaiduModal: function() {
        this.setData({
            exitSaveModal: {
                title: `转存百度网盘须知`,
                content:`由于文件存在安全问题转存至百度网盘的时间会有延迟，可40分钟后进入网盘查看`,
                role:`转存路径：我的硬件数据/小白智慧打印`,
                confirm: `确认`
            }
        })
    },

    confirmSave: function () {
        wx.setStorageSync('firstCreatorBaidu',1)
        this.uploadBaidu()
    },

    firstUploadBaidu: function () {
        let firstUploadBaidu = wx.getStorageSync('firstCreatorBaidu')
        if(firstUploadBaidu){
            this.setData({
                firstUploadBaidu:true
            })
        }else {
            this.setData({
                firstUploadBaidu:false
            })
        }
    },

    uploadBaidu: co.wrap(function*() {
        this.firstUploadBaidu()
        if (this.data.memberIds.length == 0) {
            return
        }
        try {
            let resp = yield api.checkBaiduAuth(app.openId)
            console.log(resp)
            if (resp.code == 0) {
                this.longToast.toast({
                    img: 'loading',
                    duration: 0
                })
                try {
                    const resp = yield api.uploadBaidu(app.openId, this.data.memberIds)
                    if (resp.code != 0) {
                        throw (resp)
                    }
                    this.longToast.toast()
                    console.log('上传百度云', resp.data)
                    wx.showToast({
                        title: '百度云的存储路径是：我的硬件数据/小白智慧打印',
                        icon: 'none',
                        mask: true,
                        duration: 2000
                    })
                    let that = this
                    setTimeout(function() {
                        wx.navigateBack()
                    }, 2000)
                } catch (e) {
                    this.longToast.toast()
                    util.showErr(e)
                }
            } else {
                wx.navigateTo({
                    url: `../../../print_doc/start_intro?type=baiduPrint`
                })
            }
        } catch (error) {
            util.showErr(error)
        }
    }),

    selectAll: co.wrap(function*(e) {
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
                console.log("qqqq", i, this.data.documentList.length)
                this.data.documentList[i].choose = false
                console.log("aaa", this.data.documentList[i])
                this.deleteOneId(this.data.memberIds, this.data.documentList[i].sn)
            }
        }
        this.setData({
            documentList: this.data.documentList
        })
    }),

    choose: co.wrap(function*(e) {
        console.log('e.currentTarget.id======', e.currentTarget.id)
        if (!this.data.documentList[parseInt(e.currentTarget.id)].choose) { //选中
            this.data.memberIds.push(this.data.documentList[parseInt(e.currentTarget.id)].sn)
        } else {
            this.deleteOneId(this.data.memberIds, this.data.documentList[parseInt(e.currentTarget.id)].sn)
        }
        this.data.documentList[parseInt(e.currentTarget.id)].choose = !this.data.documentList[parseInt(e.currentTarget.id)].choose
        console.log('this.data.documentList=====', this.data.documentList)
        this.setData({
            documentList: this.data.documentList
        })
        if (this.data.memberIds.length == this.data.documentList.length) {
            console.log("11111")
            this.setData({
                selectText: '取消'
            })
        } else {
            console.log("2222")
            this.setData({
                selectText: '全选'
            })
        }
    }),


    deleteOneId: function(array, item) {
        console.log('这里333333333333')
        Array.prototype.indexOf = function(val) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == val) return i;
            }
            return -1;
        };
        Array.prototype.remove = function(val) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };
        return array.remove(item)
    },
})
