// pages/error_book/submit_success.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')

import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')
Page({
    data: {

    },
    onLoad: function (options) {
        this.longToast = new app.weToast()
        this.course = options.course
        this.id = options.id
        this.setData({
            type: options.type
        })
    },
    goBack: co.wrap(function* () {
        wx.redirectTo({
            url: `index`,
        })
    }),
    camera: co.wrap(function* () {
        if (this.data.type == 'photoAnswer' || this.data.type == 'error_book_search') {
            wx.navigateTo({
                url: `../photo_answer/camera`,
            })
        } else {
            wx.navigateTo({
                url: `camera?course=${this.course}`,
            })
        }

    }),
    //打印项设置
    toSetting: function () {
        let ids = []
        ids.push(this.id)
        logger.info(ids)
        router.navigateTo('/pages/package_feature/error_book/print', {
            course: this.course,
            ids: JSON.stringify(ids),
            mistakecount: 1
        })
    },
    onShareAppMessage: function () {
        return app.share
    },
})