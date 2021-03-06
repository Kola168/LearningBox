const app = getApp()
import {
    regeneratorRuntime,
    co,
    util,
    wxNav,
    storage
} from '../../../utils/common_import.js'
import api from '../../../network/restful_request.js'
import commonRequest from '../../../utils/common_request'
import memberGql from '../../../network/graphql/member'
import Logger from '../../../utils/logger.js'
import gql from '../../../network/graphql_request.js'
const logger = new Logger.getLogger('pages/index/index')
const event = require('../../../lib/event/event')

Page({
    data: {
        preSchool:null,
        modalObj: {
            isShow: false,
            hasCancel: false,
            title: '',
            content: '',
            confirmText: '确认'
        }
    },

    onLoad: co.wrap(function* (query) {
        this.longToast = new app.weToast()
        this.userSn = storage.get('userSn')
        if (!this.userSn) {
            return router.navigateTo('/pages/authorize/index')
        }
        yield this.getMember()

        event.on('Authorize', this, () => {
            this.userSn = storage.get('userSn')
            this.getMember()
        })
    }),

    getMember: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            let resp = yield memberGql.hasMember('cn')
            this.longToast.hide()
            this.preSchool = resp.currentUser.selectedKid.preschoolMember
    
            this.setData({
                preSchool:this.preSchool
            })
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }
    }),
    payOrder: co.wrap(function* (params) {
        this.longToast.toast({
            type: 'loading',
            title: '请稍后'
        })
        try {
            var resp = yield gql.createPaymentOrder({
                type: 'member_upgrade'
            })
            this.orderSn = resp.createPaymentOrder.paymentOrder.sn
            console.log(resp)
            this.longToast.hide()
            yield this.pay()

        } catch (e) {
            util.showError(err)
            this.longToast.hide()
        }
    }),
    pay() {
        commonRequest.createPayment(this.orderSn, () => {
            this.longToast.hide()
            wx.showToast({
                icon: 'none',
                title: '会员升级成功',
                mask: true
            })
            setTimeout(() => {
                var pages = getCurrentPages()
                var prepage = pages[pages.length - 2]
                prepage.getMember()
                wxNav.navigateBack()
            }, 1500)
        }, (isCancel,e) => {
            this.longToast.hide()
            if (!isCancel) {
                util.showError(e)
            }
        })
    },
    onUnload() {
        event.remove('Authorize', this)
    },
    onShareAppMessage() {

    }
})