// pages/course/components/components/subject_index/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from '../../../../utils/common_import'
import graphqlAll from '../../../../network/graphql_request'
import graphql from '../../../../network/graphql/subject'
Component({

  data: {
    __wetoast__: {
      reveal: false
    },
    navIcon: [
      '../images/chinese_icon.png',
      '../images/math_icon.png',
      '../images/english_icon.png'
    ],
    subjects: [],
    videoSubject: [], //同步视频学科列表
    searchObj: {
      isSearch: true,
      placeText: '请输入想要搜索的内容',
    },
    printPaperCount: 0,
    percentage: 0,
    totalPapers: 0,
    selectedPaperIndex: 0, //选中的试卷分类索引
    selectedPaperTypes: [], //试卷分类
    banners: [],
    syncList: [
      {
        name: "同步练习",
      },
      {
        name: "同步视频",
      }
    ],
    currentTabSyncIndex: 0,
    stageSn: '',
    moreNum: 0,
    moreVideoNum: 0,
  },
  lifetimes: {
    attached: co.wrap(function*(){
      this.longToast = new app.weToast(this)
      yield this.getUser()
      yield this.getBanners() //获取banner
      yield this.getLastLearn() // 获取同步练习学习人数
      yield this.getPaperCates() //获取试卷分类
      yield this.getSubjectPapers() // 获取试卷列表
    })
  },
  pageLifetimes: {
    show: co.wrap(function *() {
      yield this.getUser() //获取用户信息
      yield this.getBanners() //获取banner
      yield this.getLastLearn() // 获取同步练习学习人数
      yield this.getPaperCates() //获取试卷分类
      yield this.getSubjectPapers() // 获取试卷列表
    })
  },
  methods: {
      /**
   * 获取用户信息 
   */
    getUser: co.wrap(function * (){
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })
      try {
        var resp = yield graphqlAll.getUser()
        if (resp.currentUser && resp.currentUser.selectedKid) {
          this.setData({
            stageSn: resp.currentUser.selectedKid.stage.sn
          })
        }
      } catch(err){
        util.showError(err)
      } finally {
        this.longToast.hide()
      }
    }),
    /**
     * 获取banner
     */
    getBanners: co.wrap(function *(params) {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })

      try {
        var resp = yield graphql.getBanners()
        var banners = resp.banners
        this.setData({
          banners
        })
      } catch (err) {
        util.showError(err)
      } finally {
        this.longToast.hide()
      }
    }),
    /**
     * 获取最后一次学习
     */
    getLastLearn: co.wrap(function* () {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })

      try {
        var resp = yield graphql.getLastLearn(this.data.stageSn)
        if (!resp.xuekewang.registered) {
          return this.registerSubject()
        }
        var moreSubject = resp.xuekewang.subjects.slice(3)
        var moreVideoSubject = resp.xuekewangVideoSubject.subjects.slice(3)
        this.setData({
          subjects: resp.xuekewang.subjects.slice(0, 3),
          videoSubject: resp.xuekewangVideoSubject.subjects.slice(0, 3),
          previewVideoSum: resp.xuekewangVideoSubject.previewVideoSum,
          moreNum: moreSubject.reduce((total, subject) => {
            return total + Number(subject.currentUserNum)
          }, 0),
          moreVideoNum: moreVideoSubject.reduce((total, subject) => {
            return total + Number(subject.currentUserNum)
          }, 0),
        })
      } catch (err) {
        util.showError(err)
      } finally {
        this.longToast.hide()
      }
    }),

    registerSubject: co.wrap(function*() {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })
      try {
        let res = yield graphql.register()
        if (res.register.state) {
          this.getLastLearn()
        } else {
          throw (res)
        }
        this.longToast.hide()
      } catch (error) {
        this.longToast.hide()
        util.showError(error)
      }
    }),

    /**
     * 获取试卷分类列表
     */
    getPaperCates: co.wrap(function *() {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })
      try {
        var resp = yield graphql.getPaperCates()
        var selectedPaperTypes = resp.xuekewang.selectedPaperTypes
        var selectedPaperType = null, selectedPaperIndex = 0
        selectedPaperTypes.forEach((item, idx)=> {
          if (item.id == resp.xuekewang.selectedPaperSubject.paperTypeId) {
            selectedPaperIndex = idx
            selectedPaperType= item
          }
        })
        this.gradeId = resp.xuekewang.selectedPaperSubject.gradeId
        this.subjectId = resp.xuekewang.selectedPaperSubject.subjectId
        this.paperType = resp.xuekewang.selectedPaperSubject.paperTypeId
        this.areaId = resp.xuekewang.selectedPaperSubject.areaId

        this.setData({
          selectedPaperIndex,
          selectedPaperTypes: resp.xuekewang.selectedPaperTypes,
          printPaperCount: resp.xuekewang.printPaperCount,
          percentage: resp.xuekewang.percentage,
          totalPapers: resp.xuekewang.totalPapers,
        })
      } catch(err) {
        util.showError(err)
      } finally {
        this.longToast.hide()
      }

    }),

    /**
     * 获取试卷列表
     */
    getSubjectPapers: co.wrap(function* () {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })
      try {
        var resp = yield graphql.getSubjectPapers(this.subjectId, this.paperType, this.gradeId, this.areaId,  1)
        this.setData({
          paperLists: resp.xuekewang.paperLists
        })
      } catch (err) {
        util.showError(err)
      } finally {
        this.longToast.hide()
      }
    }),

    /**
     * 切换试卷分类
     * @param {*} param0 
     */
    changeTab: co.wrap(function *({currentTarget: {dataset: {index}}}) {
      var cateGorys = this.data.selectedPaperTypes[index]
      this.paperType = cateGorys.id
      this.setData({
        selectedPaperIndex: index
      })
      this.getSubjectPapers()
    }),

    /**
     * 跳转学科详情
     * @param {index} param0 
     */
    toSubject({
      currentTarget: {
        dataset: {
          index
        }
      }
    }) {
      wxNav.navigateTo('/pages/package_subject/sync_learn/learn_content/index', {
        index
      })
    },

    toVideoSubject({
      currentTarget: {
        dataset: {
          index
        }
      }
    }) {
      wxNav.navigateTo('/pages/package_subject/sync_video/index/index', {
        index
      })
    },

    /**
     * 跳转错题本
     */
    toErrorBook({
      currentTarget: {
        dataset: {
          key
        }
      }
    }) {
      var pathMapping = {
        superErrorBook: '/pages/package_subject/super_errorbook/index/index',
        errorBook: '/pages/package_feature/error_book/index'
      }
      var path = pathMapping[key]
      path && wxNav.navigateTo(path)
    },

    /**
     * 查看更多
     */
    toMore () {
      wxNav.navigateTo('/pages/package_subject/evaluate_exam/index/index')
    },

    /**
     * 打印学习
     */
    toPrint: co.wrap(function *({currentTarget: {dataset: {item}}}) {
     try {
      wxNav.navigateTo('/pages/package_subject/evaluate_exam/preview/index', {
        id: item.paperId,
        subjectId: this.subjectId,
        sn: item.sn || '',
        hasReport: item.isReport ? 1 : 0,
        name:item.title
      })
     } catch(err) {
      //  console.log(err)
     }
    }),

    toExaminationReporter: co.wrap(function*(){
     wxNav.navigateTo('/pages/package_subject/exam_paper_report/index/index')
    }),

    toStageReporter: co.wrap(function*(){
      wxNav.navigateTo('/pages/package_subject/stage_report/index/index')
    }),

    switchsyncContentTab: function({currentTarget: {dataset: {index}}}){
      this.setData({
        currentTabSyncIndex: index
      })
    }
  }
})