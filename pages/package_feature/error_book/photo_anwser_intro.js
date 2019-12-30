const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const authorize = util.promisify(wx.authorize)
import router from '../../../utils/nav'
Page({
    data: {
        allowCamera: true
    },

    onLoad: function (options) {
        if (options.scene) {
            let fromScene = decodeURIComponent(options.scene)
            let scene = fromScene.split('_')
            this.from = scene[0]
            if (this.from == 'application') {
                this.share_user_id = scene[1]
                this.way = 5
                console.log('应用二维码参数', this.share_user_id, this.way)
            }
        }
    },
    onShow: function () {
        let authToken = wx.getStorageSync('authToken')
        if (!authToken) {
            let url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
            wx.navigateTo({
                url: url,
            })
        }
    },
    allowAuth: co.wrap(function* () {
        try {
            yield authorize({
                scope: 'scope.camera'
            })
            router.redirectTo('/pages/package_feature/error_book/camera', {
                type: 'photo_answer'
            })
        } catch (e) {
            console.log('获取授权/授权失败', e)
            this.setData({
                allowCamera: false
            })
        }
    }),
    authBack(e) {
        console.log(e)
        if (!e.detail.authSetting['scope.camera']) {
            return
        }
        this.setData({
            allowCamera: true
        })
    }
})