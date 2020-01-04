// pages/course/components/components/subject_index/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from '../../../../utils/common_import'
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
  },
  lifetimes: {
    attached: co.wrap(function*(){
      this.longToast = new app.weToast(this)
    })
  },
  pageLifetimes: {
    show: co.wrap(function *() {
      yield this.getBanners() //获取banner
      yield this.getLastLearn() // 获取同步练习学习人数
      yield this.getPaperCates() //获取试卷分类
      yield this.getSubjectPapers() // 获取试卷列表
    })
  },
  methods: {
    /**
     * 获取banner
     */
    getBanners: co.wrap(function *(params) {
      this.setData({
        '__wetoast__.reveal': true
      })
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
        var resp = yield graphql.getLastLearn()
        if (!resp.xuekewang.registered) {
          return this.registerSubject()
        }
        var moreSubject = resp.xuekewang.subjects.slice(3)
        this.setData({
          subjects: resp.xuekewang.subjects.slice(0, 3),
          moreNum: moreSubject.reduce((total, subject) => {
            return total + Number(subject.currentUserNum)
          }, 0)
        })
      } catch (err) {
        util.showError(err)
      } finally {
        this.longToast.hide()
      }
    }),

    registerSubject: co.wrap(function*() {
      try {
        let res = yield graphql.register()
        if (res.Register.state) {
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
        superErrorBook: '',
        errorBook: '/pages/package_feature/error_book/index'
      }
      var path = pathMapping[key]
      path && wxNav.navigateTo(path)
    },

    /**
     * 查看更多
     */
    toMore () {
      wxNav.navigateTo('package_subject/evaluate_exam/index')
    },

    /**
     * 打印学习
     */
    toPrint: co.wrap(function *({currentTarget: {dataset: {item}}}) {
      wxNav.navigateTo('package_subject/evaluate_exam/preview', {
        id: item.paperId,
        hasReport: item.isReport ? 1 : 0,
        name:item.title
      })
    })
  }
})