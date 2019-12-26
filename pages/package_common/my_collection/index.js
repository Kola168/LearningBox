// pages/package_common/my_collection/index.js
"use strict"
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../utils/common_import'
import commonRequest from '../../../utils/common_request.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/feedback/index')

Page({
    data: {
        // collectList: [],
        collectList: [{
          icon_url:'./../images/my_collection_word.png',
          title: '小学三年级语文人教版真题',
          category_name: '试卷'
        },{
          icon_url:'./../images/my_collection_pdf.png',
          title: '寓言两则',
          category_name: '寓言故事'
        }],
        arrow_right_url:'./../images/arrow_right.png'
    },

    onLoad: co.wrap(function*(options) {
        this.longToast = new app.WeToast()
        this.pageEnd = false
    }),
    onShow: co.wrap(function*() {
        this.page = 1
        yield this.getCollectList()
    }),

    getCollectList: co.wrap(function*() {
        this.longToast.toast({
            img: '../../images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        if (this.page == 1) {
            this.setData({
                collectList: []
            })
            this.pageEnd = false
        }
        try {
            let params = {
                'page': this.page,
                "per": 20,
                "type": 'ec_content',
                "openid": app.openId
            }
            const resp = yield api.getCollectList(params)
            if (resp.code != 0) {
                throw (resp)
            }
            console.log('我的收藏', this.page, resp)
            this.longToast.toast()
            if (resp.res.length < 20) {
                this.pageEnd = true
            }
            if (resp.res.length == 0) {
                return
            }
            this.setData({
                collectList: this.data.collectList.concat(resp.res)
            })
            this.page++
        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }
    }),
    toPreview: co.wrap(function*(e) {
        let index = e.currentTarget.id
        let currentInfo = this.data.collectList[index]
        let url = `../library/play_preview?&title=${currentInfo.title}&sn=${currentInfo.category_sn}&id=${currentInfo.sn}&type=_fun`
        if (currentInfo.type && currentInfo.type === 'composition') {
            url= `/pages/error_book/pages/composition/article_detail/article_detail?sn=${currentInfo.sn}`
        }
        wx.navigateTo({
            url
        })
    }),
    onReachBottom: function() {
        console.log('this.pageEnd', this.pageEnd)
        if (this.pageEnd) {
            return
        }
        this.getCollectList()
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return app.share
    },

    backToHome: function() {
        wx.switchTab({
            url: '../index/index'
        })
    }
})
