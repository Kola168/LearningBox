// pages/photo/index.js
"use strict"
const app = getApp()
import router from '../../utils/nav'

Page({
    data: {
        showGetModal: false, //耗材推荐弹窗
        supply_types: '',
        consumablesIcon: false, //耗材推荐图标
        type: 'normal'
    },
    onLoad: function (options) {
        this.setData({
            type: options.type
        })
    },
    onShow: function () {},

    onShareAppMessage: function () {
        return app.share
    },

    toPrint: function (e) {
        let media_type = e.currentTarget.id
        router.navigateTo(`normal_edit`,{
            media_type
        })
    }
})