// pages/package_subject/components/choose-subject/index.js
"use strict"

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
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
    var subjects = storage.get("subjectsData")
    if (subjects) {
      return this.setData({
        subjects
      })
    }
    yield this.getSubject()
  }),

  data: {
    currentIndex: 0
  },

  methods: {
    /**
     * 获取学科信息
     */
    getSubject: co.wrap(function*(){
      try {
        var resp = yield graphql.getSubject()
        this.setData({
          subjects: resp.xuekewang.subjects
        })
        storage.put("subjectsData", resp.xuekewang.subjects)
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
