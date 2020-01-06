const app = getApp()
import {
    regeneratorRuntime,
    co,
    util,
} from '../../../utils/common_import.js'
import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
import storage from '../../../utils/storage'
const event = require('../../../lib/event/event')

Page({
    data: {
        users: null,
        kidInfo: null,
        shareGroupSn: '',
        modalObj: {
            isShow: false,
            hasCancel: false,
            title: '温馨提示',
            content: '家庭成员已满，您暂时无法加入',
            confirmText: '确认'
        }
    },
    onLoad: co.wrap(function* (options) {
        this.longToast = new app.weToast()
        this.options = options
        this.userSn = storage.get('userSn')
        if (!this.userSn) {
            return router.navigateTo('/pages/authorize/index')
        }
        yield this.getFamilyUser()
        if (this.options.shareGroupSn) {
            this.setData({
                shareGroupSn: this.options.shareGroupSn
            })
        }
        logger.info(this.data.shareGroupSn)
        event.on('Authorize', this, () => {
            this.userSn = storage.get('userSn')
            this.getFamilyUser()
            if (this.options.shareGroupSn) {
                this.setData({
                    shareGroupSn: this.options.shareGroupSn
                })
            }
        })
    }),
    kickOutGroupUser: co.wrap(function* (e) {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            const resp = yield gql.kickOutGroupUser({
                userSn: e.currentTarget.id
            })
            yield this.getFamilyUser()
            this.longToast.hide()
        } catch (error) {
            logger.info(error)
            this.longToast.hide()
            util.showError(error)
        }
    }),
    exitGroup() {
        this.joinOrExitGroup(this.groupSn, 'exit')
    },
    joinGroup() {
        if (!this.groupSn) {
            return
        }
        this.joinOrExitGroup(this.groupSn, 'join')
    },
    joinOrExitGroup: co.wrap(function* (sn, ops) {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            const resp = yield gql.joinOrExitGroup({
                sn: sn,
                operation: ops
            })
            this.setData({
                shareGroupSn: ''
            })
            this.longToast.hide()
        } catch (error) {
            logger.info(error)
            this.longToast.hide()
            // util.showError(error)
            this.setData({
                'modalObj.content': e.errors[0].message
            })
        }
    }),
    getFamilyUser: co.wrap(function* () {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            const resp = yield gql.getFamilyUser()
            this.longToast.hide()
            this.groupSn = resp.currentUser.currentGroup.sn
            this.setData({
                currentUserIsCreator: resp.currentUser.currentGroup.currentUserIsCreator,
                kidInfo: resp.currentUser.currentGroup.kid,
                users: resp.currentUser.currentGroup.users
            })
        } catch (error) {
            logger.info(error)
            this.longToast.hide()
            util.showError(error)
        }
    }),
    onUnload() {
        event.remove('Authorize', this)
    },
    onShareAppMessage: function (res) {
        if (res.from === 'button' || res[0].from === 'button') {
            console.log(res.target)
        }
        return {
            title: '黑呵呵呵额呵呵',
            path: `/pages/package_member/group/index?shareGroupSn=${this.groupSn}`,
            // imageUrl: '/images/share_image.jpg'
        }
    }
})