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

Page({
    data: {
        state: 'normal',
        users: null,
        kidInfo: null
    },
    onLoad: co.wrap(function* (options) {
        this.longToast = new app.weToast()
        this.options = options
        this.userSn = storage.get('userSn')
        if (!this.userSn) {
            return router.navigateTo('/pages/authorize/index')
        }
        yield this.getFamilyUser()
        if (this.options.groupSn) {
            yield this.joinOrExitGroup(this.options.groupSn, 'join')
        }
        event.on('Authorize', this, () => {
            this.userSn = storage.get('userSn')
            this.getFamilyUser()
            if (this.options.groupSn) {
                yield this.joinOrExitGroup(this.options.groupSn, 'join')
            }
        })
    }),
    joinOrExitGroup: co.wrap(function* (sn, ops) {
        this.longToast.toast({
            type: 'loading'
        })
        try {
            const resp = yield gql.joinOrExitGroup({
                sn: sn,
                operation: ops
            })
            this.longToast.hide()
        } catch (error) {
            logger.info(error)
            this.longToast.hide()
            util.showErr(error)
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
                currentUserIsCreator: resp.currentUser.currentGroup.urrentUserIsCreator,
                kidInfo: resp.currentUser.currentGroup.kid,
                users: resp.currentUser.currentGroup.users
            })
        } catch (error) {
            logger.info(error)
            this.longToast.hide()
            util.showErr(error)
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
            path: `/pages/package_member/group/index?groupSn=${this.groupSn}`,
            // imageUrl: '/images/share_image.jpg'
        }
    }
})