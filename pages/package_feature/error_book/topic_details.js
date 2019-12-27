// pages/error_book/topic_details.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const uploadFormId = require('../../../utils/gfd-formid-upload')


Page({
    data: {
        urls: [],
        subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'],
        level: ["不懂", "略懂", "基本懂", "完全懂", "熟练"],
        reason: ["概念模糊", "思路错误", "运算错误", "审题错误", "粗心大意"],
        subjectId: 0,
        levelId: 0,
        reasonId: 0,
        reEdit: false, //从错题列表再次修改
        gradeList: [{
            "title": "小学",
            "grades": ["一年级(上)", "一年级(下)", "二年级(上)", "二年级(下)", "三年级(上)", "三年级(下)", "四年级(上)", "四年级(下)", "五年级(上)", "五年级(下)", "六年级(上)", "六年级(下)"]
        }, {
            "title": "初中",
            "grades": ["初一(上)", "初一(下)", "初二(上)", "初二(下)", "初三(上)", "初三(下)"]
        }, {
            "title": "高中",
            "grades": ["高一(上)", "高一(下)", "高二(上)", "高二(下)", "高三(上)", "高三(下)"]
        }],
        activeGrade: '',
        openGrade: 0,
        showGrade: false,
        //error_book_search错题详情传给搜题   photoAnswer查看解析  before_add_error_book保存错题前传给搜题
        type: '',
        answer_urls: [],
        iosModal: false,
        text: '当日错题本使用次数已经用完，升级会员可以畅享使用'
    },
    onLoad: co.wrap(function* (options) {
        this.longToast = new app.weToast()
        console.log('保存页参数', options)
        if (options.url) {
            this.data.urls.push(options.url)
        }
        if (options.urls) {
            this.reEdit = true
            let reason = this.data.reason.indexOf(options.reason)
            let level = this.data.level.indexOf(options.level)
            console.log(reason, level)
            this.setData({
                reasonId: reason,
                levelId: level,
                urls: JSON.parse(options.urls),
                reEdit: true
            })
            this.id = options.id
            this.course = options.course
        }
        if (options.answerUrls || options.answer_urls) {
            this.setData({
                answer_urls: JSON.parse(options.answerUrls || options.answer_urls),
            })
        }

        this.setData({
            urls: this.data.urls,
            type: this.options.type||null
        })
        console.log('所有图片', this.data.urls)
    }),
    onShow: function () {

    },
    chooseSubject: function (e) {
        let id = e.currentTarget.id
        this.setData({
            subjectId: id
        })
    },
    chooseLevel: function (e) {
        let id = e.currentTarget.id
        this.setData({
            levelId: id
        })
    },
    chooseReason: function (e) {
        let id = e.currentTarget.id
        this.setData({
            reasonId: id
        })
    },
    addMore: function () {
        wx.navigateTo({
            url: `camera?from=topic_details`
        })
    },
    deleteImg: co.wrap(function* (e) {
        let index = e.currentTarget.id
        this.data.urls.splice(index, 1)
        this.setData({
            urls: this.data.urls
        })
    }),
    save: co.wrap(function* (e) {
        console.log('错题保存form发生了submit事件，携带数据为：', e.detail.formId)
        uploadFormId.dealFormIds(e.detail.formId, e.currentTarget.dataset.type)
        uploadFormId.upload()
        let method = this.data.reEdit ? 'PUT' : 'POST'
        let id = this.id ? this.id : ''
        let params = {
            openid: app.openId,
            course: this.course ? this.course : this.data.subjects[this.data.subjectId], //学科
            urls: this.data.urls,
            level: this.data.level[this.data.levelId],
            reason: this.data.reason[this.data.reasonId],
            version: true
        }
        if (this.data.answer_urls != null) {
            params.answer_urls = this.data.answer_urls
        }
        this.longToast.toast({
            type: 'loading'
        })
        console.log('提交错题参数', params)
        try {
            const resp = yield gql.saveMistakes()
            // const resp = yield request({
            //     url: app.apiServer + `/ec/v2/mistakes/${id}`,
            //     method: method,
            //     dataType: 'json',
            //     data: params
            // })
            // if (resp.data.code == 80000) {
            //     this.longToast.toast()
            //     return this.setData({
            //         iosModal: true,
            //     })
            // } else if (resp.data.code != 0) {
            //     throw (resp.data)
            // }
            // console.log('错题已提交====', resp.data)
            // if (this.data.reEdit) {
            //     let pages = getCurrentPages()
            //     let prevPage = pages[pages.length - 2]
            //     prevPage.getMistakes()
            //     wx.navigateBack()
            // } else {
            //     wx.redirectTo({
            //         url: `submit_success?course=${params.course}&type=${this.data.type}&id=${resp.data.mistake.id}`
            //     })
            // }


            this.longToast.hide()
        } catch (e) {
            this.longToast.toast()
            util.showErr(e)
        }
    }),
    showGrades: function () {
        this.setData({
            showGrade: true
        })
    },
    hideGrades: function () {
        this.setData({
            showGrade: false
        })
    },
    //查看解析
    watch: function () {
        wx.navigateTo({
            url: `/pages/error_book/pages/photo_answer/print?urls=${JSON.stringify(this.data.answer_urls)}&type=photoAnswer`
        })
    },
    //搜答案
    search: function () {
        console.log(this.course)
        wx.navigateTo({
            url: `../photo_answer/result?url=${this.data.urls[0]}&course=${this.course}&level=${this.data.level[this.data.levelId]}&reason=${this.data.reason[this.data.reasonId]}&id=${this.id}&type=error_book_search`,
        })
    },
    //搜答案
    searchBeforAdd: function () {
        console.log(this.course)
        wx.navigateTo({
            url: `../photo_answer/result?url=${this.data.urls[0]}&type=before_add_error_book`,
        })
    },

})
