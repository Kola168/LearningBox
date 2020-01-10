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
const logger = new Logger.getLogger('pages/index/index')
const event = require('../../../lib/event/event')

Page({
    data: {
        availableMember: false,
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
        this.getDevice()

        event.on('Authorize', this, () => {
            this.userSn = storage.get('userSn')
            this.getDevice()
        })
    }),

    getMemberPaymentOrder: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            // let resp = yield memberGql.getMemberPaymentOrder(),
            this.longToast.hide()
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }
    }),
    accessMember: co.wrap(function* () {
        this.longToast.toast({
            type: "loading",
            duration: 0
        })
        try {
            const resp = yield api.wechatDecryption(params)
            if (resp.code != 0) {
                throw (resp)
            }
            this.setData({
                success: true
            })
            this.longToast.hide()
        } catch (error) {
            this.longToast.hide()
        }

    }),
    closeModal() {
        this.setData({
            success: false
        })
    },
    getDevice: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {

            let resp = yield memberGql.getDevice()
            this.longToast.hide()
            this.setData({
                device: resp.currentUser.selectedDevice
            })
            if (this.data.device == null) {
                return
            }
            this.setData({
                availableMember: this.data.device.lmAvailableMember.time != null && this.data.device.lmAvailableMember.time != 0 ? true : false
            })

            let unit = '天'
            if (this.data.device.lmAvailableMember.unit == 'month') {
                unit = '月'
            }
            if (this.data.device.lmAvailableMember.unit == 'year') {
                unit = '年'
            }
            this.setData({
                unit
            })

        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }
    }),
    onUnload() {
        event.remove('Authorize', this)
    },
    onShareAppMessage() {

    }
})