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
        modalObj: {
            isShow: false,
            hasCancel: false,
            title: '',
            content: '',
            confirmText: '确认'
        },
        pre: null,
        school: null,
        preExpiresAt: 'no', //no yes end
        schoolExpiresAt: 'no'
    },

    onLoad: co.wrap(function* (query) {
        this.longToast = new app.weToast()
        this.userSn = storage.get('userSn')
        if (!this.userSn) {
            return router.navigateTo('/pages/authorize/index')
        }
        this.getMember()

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
            let resp = yield memberGql.hasMember()
            this.longToast.hide()
            this.preSchool = resp.currentUser.selectedKid.preschoolMember
            this.school = resp.currentUser.selectedKid.schoolAgeMember
            let preExpiresAt = 'no',
                schoolExpiresAt = 'no'
            if (this.preSchool != null) {
                if (this.preSchool.expiresAt == '' || this.preSchool.expiresAt == null) {
                    preExpiresAt = 'no'
                } else if (new Date(this.preSchool.expiresAt).getTime() >= new Date().getTime()) {
                    preExpiresAt = 'yes'
                } else {
                    preExpiresAt = 'end'
                }
            }

            if (this.school != null) {
                if (this.school.expiresAt == '' || this.school.expiresAt == null) {
                    schoolExpiresAt = 'no'
                } else if (new Date(this.school.expiresAt).getTime() >= new Date().getTime()) {
                    schoolExpiresAt = 'yes'
                } else {
                    schoolExpiresAt = 'end'
                }
            }

            this.setData({
                preExpiresAt,
                schoolExpiresAt
            })


        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }
    }),
    toMemberH5() {
        wxNav.navigateTo('/pages/webview/member')
    },
    toCaculate() {
        wxNav.navigateTo('/pages/package_member/member/caculate')
    },
    onUnload() {
        event.remove('Authorize', this)
    },
    onShareAppMessage() {

    }
})