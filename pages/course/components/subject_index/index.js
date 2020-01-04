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
    selectedPaperIndex: 0, //选中的试卷分类索引
    selectedPaperTypes: [], //试卷分类
  },

  attached() {
    this.longToast = new app.weToast()
  },

  pageLifetimes: {
    show: co.wrap(function *() {
      yield this.getLastLearn()
      yield this.getPaperCates()
    })
  },
  methods: {
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
        var [selectedPaperType] = selectedPaperTypes.filter(item=> {
          return item.id == resp.selectedPaperSubject.paperTypeId
        })
        this.subjectId = resp.selectedPaperSubject.subjectId
        this.paperType = selectedPaperType.paperType
        this.areaId = resp.selectedPaperSubject.areaId

        this.setData({
          selectedPaperTypes: resp.xuekewang.selectedPaperTypes,
          printPaperCount: resp.xuekewang.printPaperCount,
          percentage: resp.xuekewang.percentage,
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
        var resp = yield graphql.getSubjectPapers(this.subjectId, this.paperType, this.areaId, 1)
       console.log(resp.xuekewang,'==getPaperCates==')
      
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
      wxNav.navigateTo('/pages/package_subject/evaluate_exam/index/index')
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