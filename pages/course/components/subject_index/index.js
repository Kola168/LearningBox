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
    subjects: []
  },

  attached() {
    this.longToast = new app.weToast()
    this.getLastLearn()
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
    }
  }
})