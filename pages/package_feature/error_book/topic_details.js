// pages/error_book/topic_details.js
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
        urls: [],
        subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'],
        level: ["不懂", "略懂", "基本懂", "完全懂", "熟练"],
        reason: ["概念模糊", "思路错误", "运算错误", "审题错误", "粗心大意"],
        subjectId: 0,
        levelId: 0,
        reasonId: 0,
        reEdit: false, //从错题列表再次修改
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
        logger.info('保存页参数', options)
        if (options.url) {
            this.data.urls.push(options.url)
        }
        if (options.urls) {
            this.reEdit = true
            let reason = this.data.reason.indexOf(options.reason)
            let level = this.data.level.indexOf(options.level)
            logger.info(reason, level)
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
            type: this.options.type || null
        })
        logger.info('所有图片', this.data.urls)
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
        router.navigateTo('/pages/package_feature/error_book/camera', {
            type: 'topic_details'
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
        let params = {
            urls: this.data.urls,
            course: this.course ? this.course : this.data.subjects[this.data.subjectId], //学科
            level: this.data.level[this.data.levelId],
            reason: this.data.reason[this.data.reasonId],
        }
        if (this.data.reEdit) {
            params.id = Number(this.id)
        }
        if (this.data.answer_urls.length > 0) {
            params.answerUrls = this.data.answer_urls
        }
        this.longToast.toast({
            type: 'loading'
        })
        logger.info('提交错题参数', params)
        try {
            const resp = yield featureGql.saveMistakes(params)

            if (this.data.reEdit) {
                let pages = getCurrentPages()
                let prevPage = pages[pages.length - 2]
                prevPage.getMistakes()
                router.navigateBack()
            } else {
                router.redirectTo('/pages/package_feature/error_book/submit_success', {
                    course: params.course,
                    type: this.data.type,
                    id: resp.createMistake.mistake
                })
            }


            this.longToast.hide()
        } catch (e) {
            this.longToast.hide()
            util.showErr(e)
        }
    }),
    //查看解析
    watch: function () {
        router.navigateTo('/pages/error_book/pages/photo_answer/print', {
            urls: JSON.stringify(this.data.answer_urls),
            type: 'photoAnswer'
        })
    },
    //搜答案
    search: function () {
        logger.info(this.course)
        router.navigateTo('/pages/error_book/pages/photo_answer/result', {
            url: this.data.urls[0],
            course: this.course,
            level: this.data.level[this.data.levelId],
            reason: this.data.reason[this.data.reasonId],
            id: this.id,
            type: 'error_book_search'
        })
        router.navigateTo('/pages/package_feature/error_book/answer_result', {
            url: this.data.urls[0],
            course: this.course,
            level: this.data.level[this.data.levelId],
            reason: this.data.reason[this.data.reasonId],
            id: this.id,
            type: 'error_book_search'
        })
    },
    //搜答案
    searchBeforAdd: function () {
        router.navigateTo('/pages/package_feature/error_book/answer_result', {
            type: 'before_add_error_book',
            url: this.data.urls[0]
        })
    },

})