// pages/package_subject/components/choose-subject/index.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../utils/common_import'
const request = util.promisify(wx.request)
import graphql from '../../../../network/graphql/subject'
import {
  getLogger
} from '../../../../utils/logger'
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  attached: co.wrap(function*(){
    yield this.getSubject()
  }),

  data: {
    currentIndex: 0
  },

  methods: {
    getSubject: co.wrap(function*(){
      try {
        var resp = yield graphql.getSubject()
        console.log(resp,'==resp==')
        this.setData({
          subjects: resp.xuekewang.subjects
        })
      } catch(err) {
        console.log(err)
      }
    }),

    /**
     * 选择学科
     * @param {*} param0 
     */
    chooseSubject: function({currentTarget: {dataset: {index}}}) {
      this.setData({
        currentIndex: index
      })
    },

    /**
     * 提交
     */
    submit: function(){
      this.triggerEvent('chooseSubject', this.data.subjects[this.data.currentIndex])
    }
  }
})
