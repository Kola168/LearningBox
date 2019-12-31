// pages/course/components/components/subject_index/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
const event = require('../../../../lib/event/event')
import graphql from '../../../../network/graphql/subject'
import storage from '../../../../utils/storage'
import router from '../../../../utils/nav.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
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

  /**
   * 组件的方法列表
   */
  methods: {
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
            return total + subject.currentUserNum
          }, 0)
        })
      } catch (err) {
        util.showError(err)
      } finally {
        this.longToast.hide()
      }
    })
  }
})