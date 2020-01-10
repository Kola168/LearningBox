// pages/package_member/member/detail.js
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
        kidInfo: null,
        memberTipUrl: '',
        checked: false,
        expiration: '',
        price: '',
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

        event.on('Authorize', this, () => {
            this.userSn = storage.get('userSn')
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
    onUnload() {
        event.remove('Authorize', this)
    },
    onShareAppMessage() {

    }
})