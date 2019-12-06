// pages/print_id/sort.js

import router from '../../utils/nav'

Page({
    data: {},
    onLoad: function (options) {},
    toZhineng: function () {
        router.navigateTo(`/pages/print_id/smart_index`)
    },
    toNomal: function () {
        router.navigateTo(`/pages/print_id/normal_list`, {
            type: 'normal'
        })
    },
    toForeign: function () {
        router.navigateTo(`/pages/print_id/normal_list`, {
            type: 'foreign'
        })
    },
    toPrint: function (e) {
        let media_type = e.currentTarget.id
        router.navigateTo(`/pages/print_id/edit`, {
            media_type
        })
    },
    onShareAppMessage: function () {

    }
})