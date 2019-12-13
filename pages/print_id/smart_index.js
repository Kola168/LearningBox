// pages/search/search.js
"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
import api from '../../network/restful_request.js'
const showModal = util.promisify(wx.showModal)
import router from '../../utils/nav'


Page({
    data: {
        placehoder: '搜索规格名称、像素、尺寸',
        inputValue: '',
        showLabel: true,
        labelList: ['一寸', '二寸', '计算机等级考试', '教师资格证', '司法考试', '电子导游证', '港澳通行证', '社保证', '小一寸', '日本签证', '建造师', '驾驶证'],
        searchList: []
    },

    onShareAppMessage: function () {
        return app.share
    },

    onLoad: co.wrap(function* (options) {
        this.longToast = new app.weToast()
    }),
    bindKeyInput: function (e) {
        this.setData({
            inputValue: e.detail.value
        })
    },
    clickInput: function (e) {
        console.log(e)
        this.setData({
            placehoder: ''
        })
    },
    resetInput: function () {
        this.setData({
            inputValue: '',
            placehoder: ''
        })
    },
    searchLabel: function (e) {
        let index = e.currentTarget.id
        console.log(index, this.data.labelList[index])
        this.setData({
            inputValue: this.data.labelList[index]
        })
        this.search()
    },
    search: co.wrap(function* () {

        if (!this.data.inputValue) {
            yield showModal({
                title: '提示',
                content: '请输入搜索类型',
                showCancel: false,
                confirmColor: '#FFE27A'
            })
            return
        }

        if (!this.data.inputValue && this.data.placehoder) {
            this.setData({
                inputValue: this.data.placehoder
            })
        }

        this.longToast.toast({
            type: 'loading',
            duration: 0
        })

        try {
            const resp = yield api.searchId(this.data.inputValue)
            if (resp.code == 0) {
                this.longToast.hide()

                if (resp.res.length == 0) {
                    return util.showError({
                        message: '没有搜到该类型哦'
                    })
                }
                this.setData({
                    searchList: resp.res,
                    showLabel: false
                })
            } else {
                this.longToast.hide()
                util.showError(resp)
                return
            }
        } catch (e) {
            this.longToast.hide()
            util.showError({
                message: '请检查您的网络，请稍后重试'
            })
            return
        }
    }),
    toRules: co.wrap(function* (e) {
        let item = JSON.stringify(this.data.searchList[e.currentTarget.id])
        router.redirectTo(`/pages/print_id/smart_rules`, {
            item
        })
    })

})