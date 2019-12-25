// pages/error_book/detail.js
"use strict"

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const uploadFormId = require('../../../utils/gfd-formid-upload')
import router from '../../../utils/nav'
import gql from '../../../network/graphql_request.js'

const request = util.promisify(wx.request)
Page({
    data: {
        firstPrint: true,
        isDelete: true,
        //全选
        allChoose: false,
        //打印提示框
        showConfirmModal: null,
        //选择题目数
        middlearr: [],
        num: 1,
        order: "ASC",
        template_id: '',
        //筛选后的题目为空
        noEntry: false,
        //课程
        course: '',
        //录入题目数量ƒ
        allNum: '',
        //选择题目数
        printNum: '',
        answer:'all'
    },
    onLoad: co.wrap(function*(options) {
        console.log("options", options)
        this.longToast = new app.weToast()
        if (options.course) {
            this.setData({
                course: options.course,
            })
        }
        this.getMistakes()

    }),
    //获取错题本列表
    getMistakes: co.wrap(function*() {
        this.longToast.toast({
            type: 'loading'
        })
        console.log("课程", this.data.course)
        let params = {
            'openid': app.openId,
            'course': this.data.course,
            'answer':this.data.answer
        }
        console.log("params", params)
        try {
            const resp = yield request({
                url: app.apiServer + `/ec/v2/mistakes?openid=${app.openId}`,
                method: 'GET',
                dataType: 'json',
                data: params
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            console.log('错题本列表====', resp.data)
                // if (resp.data.mistakes.length == 0) {
                //   this.setData({
                //     noEntry: true
                //   })
                // }
            this.setData({
                array: resp.data.mistakes,
                middlearr: [],
            })

            var con = []
            for (let i = 0; i < this.data.array.length; i++) {
                for (let j = 0; j < this.data.array[i].content.length; j++) {
                    con.push(this.data.array[i].content[j])
                    this.data.array[i].content[j].checked = false
                    this.setData({
                        // middlearr: con,
                        array: this.data.array,
                        allNum: con.length
                    })
                }
            }
            console.log('-----------', this.data.array)
            this.longToast.hide()
        } catch (e) {
            this.longToast.hide()
            util.showErr(e)
        }
    }),

    //筛选
    choose: function() {
        wx.navigateTo({
            url: `choose?course=${this.data.course}`,
        })
    },
    //错题详情
    toTopic: function(e) {
        let parentIndex = e.currentTarget.dataset.type
        let index = e.currentTarget.id
        let parent = this.data.array[parentIndex]
        let item = parent.content[index]
        console.log('当前项', parent, item)
        wx.navigateTo({
            url: `topic_details?urls=${JSON.stringify(item.urls)}&course=${item.course}&level=${item.level}&reason=${item.reason}&id=${item.id}&answer_urls=${JSON.stringify(item.answer_urls)}`,
        })
    },
    //打印项设置
    toSetting: function() {
        wx.navigateTo({
            url: `setting?middlearrNum=${this.data.middlearr.length}`,
        })
    },
    //删除设置
    toDelete: function() {
        this.setData({
            isDelete: true,
            // allChoose: true,
        })
    },
    //取消删除
    toClose: function() {
        this.setData({
            firstPrint: false,
            isDelete: false,
            allChoose: false,
        })
        for (let i = 0; i < this.data.array.length; i++) {
            for (let j = 0; j < this.data.array[i].content.length; j++) {

                this.data.array[i].content[j].checked = false;
                console.log(this.data.array)
                    // arr2.push(this.data.array[i].content[j])
                this.setData({
                    array: this.data.array,
                    middlearr: [],
                })
            }
        }
    },
    //打印并复习
    choosePrint: co.wrap(function*() {
        console.log("11111111", this.data.middlearr)
        if (this.data.array.length == 0) {
            this.setData({
                firstPrint: false,
                isDelete: false
            })
            return
        }
        let middleNum = this.data.middlearr.length
        this.setData({
            firstPrint: true,
            printNum: Math.round(middleNum / this.data.num)
        })
    }),
    //全选
    chooseAll: function() {
        this.setData({
            allChoose: !this.data.allChoose,
        })
        let arr2 = [];
        for (let i = 0; i < this.data.array.length; i++) {
            for (let j = 0; j < this.data.array[i].content.length; j++) {
                if (this.data.allChoose == true) {
                    this.data.array[i].content[j].checked = true;
                    console.log(this.data.array)
                    arr2.push(this.data.array[i].content[j])
                    this.setData({
                        array: this.data.array,
                        middlearr: arr2,
                        printNum: Math.round(arr2.length / this.data.num)
                    })
                } else {
                    this.data.array[i].content[j].checked = false;
                    console.log(this.data.array)
                    this.setData({
                        array: this.data.array,
                        middlearr: [],
                        printNum: 0
                    })
                }
            }
        }
    },
    //选择单个
    chooseOne: function(e) {
        let parentIndex = e.currentTarget.dataset.type
        let id = e.currentTarget.id
        let indexNum = this.data.array[parentIndex].content[id]
        console.log(indexNum)
        this.setData({
            allChoose: false,
        })
        let arr2 = []
        indexNum.checked = !indexNum.checked;

        for (let i = 0; i < this.data.array.length; i++) {
            for (let j = 0; j < this.data.array[i].content.length; j++) {
                if (this.data.array[i].content[j].checked) {
                    arr2.push(this.data.array[i].content[j])
                    console.log("选择错题", arr2)
                }
            }
        }
        if (arr2.length == this.data.allNum) {
            this.setData({
                allChoose: true
            })
        }

        this.setData({
            array: this.data.array,
            middlearr: arr2,
            printNum: Math.round(arr2.length / this.data.num)
        })
    },
    //打印
    quickPrint: function(e) {
        console.log('错题打印时form发生了submit事件，携带数据为：', e.detail.formId, 'print_mistake')
        uploadFormId.dealFormIds(e.detail.formId, `print_error_book`)
        uploadFormId.upload()
        if (this.data.middlearr.length == 0) {
            return wx.showToast({
                title: '请勾选错题',
                icon: 'none',
                duration: 2000
            })
            this.setData({
                showConfirmModal: null,
            })
        }
        let ids = []
        this.ids = ids
        for (let i = 0; i < this.data.middlearr.length; i++) {
            ids.push(this.data.middlearr[i].id)
            console.log("11111", ids)
        }
        wx.navigateTo({
            url: `print?course=${this.data.course}&ids=${JSON.stringify(ids)}&mistakecount=${this.data.middlearr.length}`,
        })
        return
        this.setData({
            showConfirmModal: {
                mediaType: `请确认A4纸放置正确`,
                src: `https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png`
            }
        })
    },
    //取消打印
    cancelPrint: function() {
        this.setData({
            showConfirmModal: null
        })
    },
    //删除
    confirmDelete: co.wrap(function*() {
        if (this.data.middlearr.length == 0) {
            return wx.showToast({
                title: '请选择错题',
                icon: 'none',
                duration: 2000
            })
        }
        this.longToast.toast({
            img: '../../images/loading.gif',
            title: '请稍候',
            duration: 0
        })
        let ids = []
        for (let i = 0; i < this.data.middlearr.length; i++) {
            ids.push(this.data.middlearr[i].id)
            console.log("11111", ids)
        }
        let params2 = {
            'openid': app.openId,
            'ids': ids
        }
        console.log("params2", params2)
        try {
            const resp = yield request({
                url: app.apiServer + `/ec/v2/mistakes/destroy`,
                method: 'POST',
                dataType: 'json',
                data: params2
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            console.log('删除====', resp.data)
            wx.showToast({
                    title: '删除成功',
                    icon: 'none',
                    duration: 3000
                })
                // this.toClose()
            this.getMistakes()
                // let newArray=[]
                // for (let i = 0; i < this.data.array.length; i++) {
                //   this.data.array[i].notDeleteNum=this.data.array[i].content.length//没删除的数量
                //   for (let j = 0; j < this.data.array[i].content.length; j++) {
                //     if (this.data.array[i].content[j].checked==true) {
                //       // this.data.array[i].content.splice(j, 1);
                //       this.data.array[i].content[j].hasDelete=true//已删除
                //       this.data.array[i].notDeleteNum=this.data.array[i].notDeleteNum-1
                //       console.log(this.data.array)
                //       this.setData({
                //         array: this.data.array,
                //         middlearr: []
                //       })
                //     }
                //   }
                // }
            this.longToast.toast()
        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }

    }),
    print: co.wrap(function*(e) {
        this.setData({
            showConfirmModal: null
        })
        this.longToast.toast({
            type: 'loading'
        })
        let ids = []
        this.ids = ids
        for (let i = 0; i < this.data.middlearr.length; i++) {
            ids.push(this.data.middlearr[i].id)
            console.log("11111", ids)
        }
        let params = {
            'ids': ids,
            'order': this.data.order,
            'course': this.data.course
        }
        if (this.data.template_id != '') {
            params.template_id = this.data.template_id
        }
        console.log("params", params)
        try {
            const resp = yield request({
                url: app.apiServer + `/ec/v2/images/mistake_convert`,
                method: 'POST',
                dataType: 'json',
                data: params
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            console.log('合成错题====', resp.data)
            this.setData({
                convert_urls: resp.data.urls
            })
            yield this.confirmPrint()
            this.longToast.toast()
        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }
    }),
    confirmPrint: co.wrap(function*(e) {
        this.longToast.toast({
            type: 'loading'
        })
        let link = []
        for (let i = 0; i < this.data.convert_urls.length; i++) {
            let urls = {}
            urls.url = this.data.convert_urls[i]
            urls.pre_convert_url = this.data.convert_urls[i]
            urls.color = "Color"
            urls.number = "1"
            console.log("222222222", urls)
            link.push(urls)
            console.log("1111111", link)
        }

        let params2 = {
            'openid': app.openId,
            'media_type': "mistake",
            'urls': link,
            'mistake_ids': this.ids
        }
        console.log("params2", params2)
        try {
            const resp = yield request({
                url: app.apiServer + `/ec/v2/orders`,
                method: 'POST',
                dataType: 'json',
                data: params2
            })
            if (resp.data.code != 0) {
                throw (resp.data)
            }
            console.log('打印====', resp.data)
            wx.redirectTo({
                url: `../../finish/index?media_type=mistake&state=${resp.data.order.state}`
            })
            this.longToast.hide()
        } catch (e) {
            this.longToast.hide()
            util.showErr(e)
        }
    }),
    toCamera: function() {
        wx.redirectTo({
            url: 'camera'
        })
    }

})