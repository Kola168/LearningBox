// pages/print_copybook/subject.js
"use strict"

const app = getApp()
import api from '../../../../network/api'
import {
    regeneratorRuntime,
    co,
    util,
    _,
    uploadFormId,
    common_util
} from '../../../../utils/common_import'

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const requestPayment = util.promisify(wx.requestPayment)

Page({
    data: {
        showGrade: false,
        grade: '一年级（上）',
        list: [],
        user_paid: false,
        highScreen: '',
        price: '',
        showConfirmModal: '',
        showTemplate: false

    },
    onLoad: co.wrap(function*(options) {
        this.longToast = new app.WeToast()
        console.log(options)
        let stage_sn = wx.getStorageSync('stage_sn')
        let zitie_grades = wx.getStorageSync('zitie_grades')
        let zitie_grade = wx.getStorageSync('zitie_grade')
        if (stage_sn) {
            this.setData({
                stage_sn: stage_sn
            })
        }
        if (zitie_grades) {
            this.setData({
                grades: zitie_grades
            })
        }
        if (zitie_grade) {
            this.setData({
                grade: zitie_grade
            })
        }
        wx.setNavigationBarTitle({
            title: options.title
        })
        this.setData({
            title: options.title,
            highScreen: app.sysInfo.screenHeight > 750 ? true : false
        })
        this.title = options.title
        this.sn = options.sn
        // this.name = options.user_selected_grade
        this.user_share_qrcode = options.user_share_qrcode
        // if (this.name && this.name != 'undefined' && this.name != 'null') {
        //     this.setData({
        //         grade: this.name.slice(0, 6),
        //     })
        //     this.beforeGrade = this.data.grade
        yield this.finish()
        // }
    }),
    toPay: co.wrap(function*(e) {
        this.setData({
            showConfirmModal: true
        })
    }),
    cancel: co.wrap(function*(e) {
        this.setData({
            showConfirmModal: false
        })
    }),

    confirm: co.wrap(function*(e) {
        this.longToast.toast({
            img: '/images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        this.setData({
            showConfirmModal: false
        })
        let brand
        try {
            const resp = yield api.payCopybook(app.openId, 'copy_book_set', this.sn)
            if (resp.code != 0) {
                throw (resp)
            }
            brand = resp.res
            console.log('brand-----', resp.res)
            console.log('购买成功', resp)
            this.longToast.toast()

        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }
        const payment = yield requestPayment({
            timeStamp: brand.timeStamp,
            nonceStr: brand.nonceStr,
            package: brand.package,
            signType: brand.signType,
            paySign: brand.paySign
        })
        console.log('支付信息=========', payment)
        this.setData({
            user_paid: true,
        })

    }),

    openGradeModal: function() {
        this.setData({
            showGrade: true,
            showTemplate: true
        })
    },
    changeGrade: function(e) {
        console.log(e)
        this.beforeGrade = this.data.grade
        this.setData({
            grade: this.data.grades[e.currentTarget.id].name,
            showGrade: false,
            showTemplate: false,
            stage_sn: this.data.grades[e.currentTarget.id].sn
        })
        this.finish()
        wx.setStorageSync('stage_sn', this.data.stage_sn)
        wx.setStorageSync('zitie_grade', this.data.grade)
    },

    hideModal: function() {
        if (this.data.grade == '') {
            return
        }
        this.setData({
            showGrade: false,
            showTemplate: false
        })
    },
    noEvent: function() {
        return
    },
    finish: co.wrap(function*() {
        if (this.data.grade == '' || this.data.textbook == '') {
            return
        }

        this.longToast.toast({
            img: '../../images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        console.log(this.data.stage_sn);
        try {
            let resp
            if (this.data.stage_sn == undefined || this.data.stage_sn == null || this.data.stage_sn == '') {
                resp = yield api.copyNoGradeBooksets(app.openId, 2, this.sn)
            } else {
                resp = yield api.copyGradeBooksets(app.openId, this.data.stage_sn, 2, this.sn)
            }
            console.log('查询年级字帖', resp)
            this.setData({
                showGrade: false,
            })
            // var pages = getCurrentPages()
            // var prepage = pages[pages.length - 2]
            // prepage.setData({
            //     user_selected_grade: this.data.grade,
            // })
            if (resp.code == 0) {
                this.setData({
                    list: resp.res.copy_books,
                    user_paid: resp.res.user_paid,
                    price: resp.res.price_yuan,
                    free: resp.res.free,
                    grades: resp.res.available_stages,
                })
                wx.setStorageSync('zitie_grades', this.data.grades)

            } else if (resp.code == 40000) {
                this.setData({
                    list: [],
                })
            } else {
                throw (resp)
            }
            this.longToast.toast()
        } catch (e) {
            this.setData({
                list: [],
                grade: this.beforeGrade,
            })
            this.longToast.toast()
            util.showErr(e)
        }
    }),
    toDetail: co.wrap(function*(e) {
        try {
            let parent = e.target.dataset.parent
            let id = e.currentTarget.id
            let item = this.data.list[parent].books[id]
            let name = item.name
            let sn = item.sn
            wx.navigateTo({
                url: `detail?title=${this.title}&name=${name}&sn=${sn}&user_share_qrcode=${this.user_share_qrcode}`,
            })
        } catch (e) {
            console.log(e)
        }
    }),
    onShareAppMessage: function() {

    },

})
