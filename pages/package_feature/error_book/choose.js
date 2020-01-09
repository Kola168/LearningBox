// pages/error_book/choose.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
import router from '../../../utils/nav'
import featureGql from '../../../network/graphql/feature'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/index/index')

Page({
    data: {
        time: [{
                "content": "全部"
            },
            {
                "content": "一周内",
            },
            {
                "content": "一月内"
            },
            {
                "content": "自定义"
            },
        ],
        num: [{
                "content": "全部",
                // 'isSelected': false,
            },
            {
                "content": "0",
                // 'isSelected': false,
            },
            {
                "content": "1",
                // 'isSelected': false,
            },
            {
                "content": "2",
                // 'isSelected': false,
            },
            {
                "content": "3次及以上",
                // 'isSelected': false,
            },
        ],
        level: [{
                "content": "全部",
                // 'isSelected': false,
            },
            {
                "content": "不懂",
                // 'isSelected': false,
            },
            {
                "content": "略懂",
                // 'isSelected': false,
            },
            {
                "content": "基本懂",
                // 'isSelected': false,
            },
            {
                "content": "完全懂",
                // 'isSelected': false,
            },
            {
                "content": "熟练",
                // 'isSelected': false,
            }
        ],
        anwser: [{
                "content": "全部"
            },
            {
                "content": "有",
            },
            {
                "content": "无"
            }
        ],
        timeId: 0,
        numId: 0,
        levelId: 0,
        anwserId: 0,
        isDate: false,
        custom: true,
        date1: "开始时间",
        date2: "结束时间",
        hasAnswer:'all'
    },
    onLoad: function (options) {
        this.longToast = new app.weToast()
        logger.info(options.course)
        this.setData({
            course: options.course
        })
    },
    bindDateChange1: function (e) {
        logger.info(e)
        this.setData({
            date1: e.detail.value
        })
    },
    bindDateChange2: function (e) {
        logger.info(e)
        this.setData({
            date2: e.detail.value
        })
    },
    chooseTime: function (e) {
        let id = e.currentTarget.id
        logger.info("11111", id)
        this.setData({
            timeId: id
        })
        if (this.data.timeId == 3) {
            this.setData({
                isDate: true,
            })
        } else {
            this.setData({
                isDate: false,
            })
        }

    },
    chooseNum: function (e) {
        let id = e.currentTarget.id
        this.setData({
            numId: id
        })
        // var item = this.data.num[id]
        // item.isSelected = !item.isSelected
        // this.setData({
        //   num: this.data.num
        // })
    },
    chooseLevel: function (e) {
        let id = e.currentTarget.id
        this.setData({
            levelId: id
        })
        // var item = this.data.reason[id]
        // item.isSelected = !item.isSelected
        // this.setData({
        //   reason: this.data.reason
        // })
    },
    chooseAnwser: function (e) {
        let id = e.currentTarget.id
        this.setData({
            anwserId: id
        })
    },
    confirm: co.wrap(function* () {

        let params = {
            'openid': app.openId,
            'course': this.data.course,
        }
        //时间
        if (this.data.time[this.data.timeId].content != "全部") {
            logger.info("11111")

            if (this.data.time[this.data.timeId].content == "一周内") {
                let a = new Date()
                a.getTime()
                let b = a - 1000 * 60 * 60 * 24 * 7
                let c = new Date(b)
                logger.info(c)
                params.start_at = c
            }
            if (this.data.time[this.data.timeId].content == "一月内") {
                let a = new Date()
                a.getTime()
                let b = a - 1000 * 60 * 60 * 24 * 30
                let c = new Date(b)
                logger.info(c)
                params.start_at = c
            }
            if (this.data.time[this.data.timeId].content != "一月内" && this.data.time[this.data.timeId].content != "一周内") {
                let a = this.data.date1
                let b = this.data.date2
                logger.info("99999", a, b)
                let c = new Date(a)
                let d = new Date(b)
                let e = c.getTime()
                let f = d.getTime()
                logger.info(c, d, e, f)
                let g = f + 24 * 60 * 60 * 1000
                let h = new Date(g)
                logger.info("11", g, h)
                if (a == "开始时间") {
                    return util.showErr({
                        message: '请输入开始时间'
                    })
                }
                if (b == "结束时间") {
                    return util.showErr({
                        message: '请输入结束时间'
                    })
                }
                if (e > f) {
                    return util.showErr({
                        message: '请输入正确日期'
                    })
                } else {
                    params.start_at = c
                    params.end_at = h
                }
            }
        }
        //次数
        if (this.data.num[this.data.numId].content != "全部") {
            params.print_count = this.data.num[this.data.numId].content
            if (this.data.num[this.data.numId].content == "3次及以上") {
                params.print_count = "3"
            }
        }
        //程度
        if (this.data.level[this.data.levelId].content != "全部") {
            params.level = this.data.level[this.data.levelId].content
        }
        //解析
        if (this.data.anwser[this.data.anwserId].content== "全部") {
            params.answer = 'all'
        }
        if (this.data.anwser[this.data.anwserId].content== "有") {
            params.answer = 'has_answer'
        }
        if (this.data.anwser[this.data.anwserId].content== "无") {
            params.answer = 'no_answer'
        }
        logger.info("params345678900000", params)
        this.longToast.toast({
            type: 'loading'
        })

        try {
            const resp = yield featureGql.getMistakes()
            // const resp = yield request({
            //     url: app.apiServer + `/ec/v2/mistakes?openid=${app.openId}`,
            //     method: 'GET',
            //     dataType: 'json',
            //     data: params
            // })
            // if (resp.data.code != 0) {
            //     throw (resp.data)
            // }
            // logger.info('筛选列表====', resp.data)
            // this.setData({
            //     array: resp.data.mistakes
            // })
            // var con = []
            // for (let i = 0; i < this.data.array.length; i++) {
            //   for (let j = 0; j < this.data.array[i].content.length; j++) {
            //     con.push(this.data.array[i].content[j])
            //     logger.info("con", con)
            //     // this.data.array[i].content[j].checked = true
            //     this.setData({
            //       middlearr: con,
            //     })
            //   }
            // }
            // if (this.data.array.length == 0) {
            //   this.setData({
            //     middlearr: []
            //   })
            // }
            this.longToast.hide()
        } catch (e) {
            this.longToast.hide()
            util.showError(e)
        }

        var pages = getCurrentPages()
        var prepage = pages[pages.length - 2]
        prepage.setData({
            "array": this.data.array,
            "middlearr": [],
            noEntry: true
            // "middlearr": this.data.middlearr
        })
        router.navigateBack()
    })
})