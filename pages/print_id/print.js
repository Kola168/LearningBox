const app = getApp()
import {
    regeneratorRuntime,
    co,
    util,
    wxNav,
    storage
} from '../../utils/common_import.js'
import api from '../../network/restful_request.js'
import commonRequest from '../../utils/common_request'
import memberGql from '../../network/graphql/member'
import Logger from '../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
const event = require('../../lib/event/event')
const imginit = require('../../utils/imginit')

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

    onLoad: co.wrap(function* (options) {
        try {
            this.longToast = new app.weToast()
            console.log('打印页参数', options)
            let url = JSON.parse(options.url)
            url = imginit.addProcess(url, '/rotate,90')
            this.setData({
                url,
                sn: options.sn
            })
        } catch (error) {
            console.log(error)
        }
       
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
    onShareAppMessage() {

    }
})