// pages/package_common/feedback/feedback.js
"use strict"

const app = getApp()
import {
    regeneratorRuntime,
    co,
    util,
    wxNav
  } from '../../../utils/common_import'
import gql from '../../../network/graphql_request'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/feedback/index')

Page({
    data: {
        telphone: '',
        content: '',
        questionTypes:[
            {
                type:'给产品提意见',
                as_type:'idea'
            },
            {
                type:'打印机无法绑定提示离线',
                as_type:'offline'
            },
            {
                type:'对产品功能有疑问',
                as_type:'feature'
            },
            {
                type:'打印速度慢，打印不出',
                as_type:'slow'
            },
            {
                type:'新增内容',
                as_type:'search'
            },
            {
                type:'其他',
                as_type:'other'
            }
        ],
        tabId:-1
    },


    onLoad: function(options) {
        this.longToast = new app.weToast()
    },

    //分享
    onShareAppMessage: function() {

    },

    //获取问题类型
    chooseType:function (e) {
        logger.info(e);
        this.setData({
            tabId:e.currentTarget.dataset.id
        })
        this.as_type = this.data.questionTypes[e.currentTarget.dataset.id].as_type
    },

    //获取建议或问题
    contentinput: function(e) {
        var textareaValue = e.detail.value;
        this.setData({
            content: textareaValue
        })
    },

    //获取手机号
    number: function(e) {
         //电话号码或手机号码验证
         var mobile = e.detail.value;
         var tel = /^0\d{2,3}-?\d{7,8}$/;
         var phone = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0,9]{1}))+\d{8})$/;
        this.setData({
            telphone: mobile
        })
    },

    //表单提交
    submit: co.wrap(function*() {
        logger.info(this.data.content, this.data.telphone)
        if (this.data.tabId == -1) {
            return util.showError({
                message: '请选择问题类型'
            })
        }
        if (this.data.content.trim() == '') {
            return util.showError({
                message: '内容不能为空'
            })
        }
        if (this.data.content.length < 10) {
            return util.showError({
                message: '输入的内容必须超过10个字，这样我们才能更快了解到您的建议'
            })
        }
        if(this.data.telphone.length != 11 || (this.data.telphone.length == 13 && this.data.telphone.indexOf("-1") != -1)){//手机号
            return util.showError({
                message: '请输入正确的电话号码'
            })
        }
        this.longToast.toast({
            img: '../../images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        try {
            var params = {
                feedType:this.as_type,
				phone: this.data.telphone,
                content: this.data.content
			}
            const resp = yield gql.createFeedback(params)
            this.setData({
                feedType: resp.feedType,
                phone: resp.phone,
                content: resp.content
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            logger.info('意见反馈', resp.data)
            this.longToast.toast()
            wx.showToast({
                title: '提交成功！',
                icon: 'none',
                duration: 3000
            })
            setTimeout(() => {
                wxNav.navigateBack()
            }, 3000);

        } catch (e) {
            this.longToast.toast()
            util.showError(e)
        }

    }),


    //呼叫客服热线
    call: function() {
        wx.makePhoneCall({
            phoneNumber: '400-001-9178'
        })
    },

    //复制客服微信
    copyText: function(e) {
        console.log(e)
        wx.setClipboardData({
            data: 'gfdxiaobai',
            success(res) {
                wx.getClipboardData({
                    success(res) {
                        wx.showToast({
                            title: '客服微信已复制成功',
                            duration: 1500,
                            icon: 'none',
                        })
                    }
                })
            }
        })
    },
})
