// pages/photo/index.js
"use strict"
const app = getApp()

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
        if (options.type == 'foreign') {
            wx.setNavigationBarTitle({
                title: '各类签证'
            })
        }
    },
    onShow: function () {},

    onShareAppMessage: function () {
        return app.share
    },

    toPrint: function (e) {
        let media_type = e.currentTarget.id
        wx.navigateTo({
            url: `normal_edit?media_type=${media_type}`
        })
    }
})