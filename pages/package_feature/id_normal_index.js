// pages/print_id/sort.js
// import commonRequest from '../../utils/common_request.js'
Page({
    data: {},
    onLoad: function (options) {},
    toZhineng: function () {
        wx.navigateTo({
            url: `../error_book/pages/print_id/index`
        })
    },
    toNomal: function () {
        wx.navigateTo({
            url: `id_normal_list?type=normal`
        })
    },
    toForeign: function () {
        wx.navigateTo({
            url: `id_normal_list?type=foreign`
        })
    },
    toPrint: function (e) {
        let media_type = e.currentTarget.id
        wx.navigateTo({
            url: `edit?media_type=${media_type}`
        })
    },
    onShareAppMessage: function () {

    }
})