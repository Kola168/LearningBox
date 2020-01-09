const app = getApp()
import {
    regeneratorRuntime,
    co,
    util,
    wxNav,
    storage
} from '../../../utils/common_import.js'
import commonRequest from '../../../utils/common_request'
import memberGql from '../../../network/graphql/member'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
const event = require('../../../lib/event/event')
const getSystemInfo = util.promisify(wx.getSystemInfo)


Page({
    data: {
        system: ''
    },

    onLoad: co.wrap(function* (query) {
        this.longToast = new app.weToast()
        let res = yield getSystemInfo()
        this.setData({
            system: res.system.indexOf('ios') > -1 ? 'ios' : 'android'
        })
        this.userSn = storage.get('userSn')
        if (!this.userSn) {
            return router.navigateTo('/pages/authorize/index')
        }
        yield this.getDevice()

        event.on('Authorize', this, () => {
            this.userSn = storage.get('userSn')
            this.getDevice()
        })
    }),
    toMemberH5() {
        wxNav.navigateTo('/pages/webview/member')
    },
    getFreeMember(){

    },
    getDevice: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            let resp = yield memberGql.getDevice()
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