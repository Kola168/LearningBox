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
import api from '../../../network/restful_request.js'


Page({
    data: {
        system: '',
        device: null,
        availableMember: false,
        availableMemberModal: false,
        unit: '天',
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
        let res = yield getSystemInfo()
        this.setData({
            system: res.system.indexOf('iOS') > -1 ? 'ios' : 'android'
        })
        this.userSn = storage.get('userSn')
        if (!this.userSn) {
            return wxNav.navigateTo('/pages/authorize/index')
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
    getFreeMember() {
        wxNav.navigateTo('/pages/webview/index', {
            url: `${app.apiServer}/customer/members/free_trial`
        })
    },
    showModal() {
        this.setData({
            availableMemberModal: true
        })
    },
    printMemberCode: co.wrap(function* () {
        if (this.data.device == null) {
            this.setData({
                'modalObj.content': '设备列表为空，暂无法获取会员，请先绑定打印机'
            })
        }
        this.longToast.toast({
            type: "loading",
            duration: 0
        })
        try {
            const resp = yield api.printMemberCode()
            if (resp.code != 0) {
                throw (resp)
            }
            wx.showModal({
                title: '提示',
                content: '请查看打印出来的会员详情',
                showCancel: false,
                confirmColor: '#ffdc5e'
            })
            this.longToast.hide()
        } catch (error) {
            util.showError(error)
            this.longToast.hide()
        }

    }),
    toAccessMember: co.wrap(function* () {
        this.longToast.toast({
            type: "loading",
            duration: 0
        })
        try {
            const resp = yield api.accessMember()
            if (resp.code != 0) {
                throw (resp)
            }
            let modalObj = {
                isShow: false,
                hasCancel: false,
                title: '',
                content: `${this.data.device.lmAvailableMember.time}${this.data.device.lmAvailableMember.time}的会员已激活成功，祝您使用愉快`,
                confirmText: '确认'
            }
            this.setData({
                modalObj
            })
            this.longToast.hide()
        } catch (error) {
            util.showError(error)
            this.longToast.hide()
        }

    }),
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
            if (this.data.device == null || this.data.device.lmAvailableMember == null) {
                return
            }

            this.setData({
                availableMember: this.data.device.lmAvailableMember.time != null && this.data.device.lmAvailableMember.time != 0 ? true : false,
                availableMemberModal: this.data.device.lmAvailableMember.time != null && this.data.device.lmAvailableMember.time != 0 ? true : false
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
    close() {
        this.setData({
            availableMemberModal: false
        })
    },
    toNext() {
        wxNav.navigateTo('/pages/package_member/member/active')
    },
    onUnload() {
        event.remove('Authorize', this)
    },
    onShareAppMessage() {

    }
})