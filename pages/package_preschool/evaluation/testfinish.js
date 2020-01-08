// pages/package_preschool/evaluation/testfinish.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import gql from '../../../network/graphql/preschool'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}


Page({

  data: {
    achievementArr: [],
    fullMarks: 4, //满分
    scale: 2, //正确题数与分数的比例
    recommendTest: [], ///推荐题目
    kidpercent:90,
  },

  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.answerList=JSON.parse(decodeURIComponent(options.snlist))
    this.sn = options.sn
    this.initGrade()
  },

  initGrade: co.wrap(function*() {
    try {
      let achievementList = []
      let collectAnswers = {}
      _.each(this.answerList, function(value, index, list) {
        collectAnswers[`${value.sn}`]=_.isObject(collectAnswers[`${value.sn}`])?collectAnswers[`${value.sn}`]:{}
        _.extend(collectAnswers[`${value.sn}`],{
          sn:value.sn,
          category_name:value.category_name,
        })
        collectAnswers[value.sn].grade = _.isNumber(collectAnswers[value.sn].grade) ? collectAnswers[value.sn].grade : 0
        collectAnswers[value.sn].num = _.isNumber(collectAnswers[value.sn].num) ? (collectAnswers[value.sn].num+1) : 1
        if (value.is_right) {
          collectAnswers[value.sn].grade += 1
        }
      })
      Loger(collectAnswers)
      this.setData({
        achievementArr:_.values(collectAnswers)
      })
      let wrongList=_.values(_.indexBy(_.where(this.answerList,{is_right:false}), 'sn'))
      Loger(wrongList)
      if(wrongList.length>0){
        this.setData({
          recommendTest:wrongList
        })
      }else{
        this.setData({
          kidpercent:_.random(90,100)
        })
      }
    } catch (e) {
      Loger(e)
    }
  }),

  toprint: co.wrap(function*() {
    try {
      this.longToast.toast({
        type:'loading'
      })
      let resp = yield gql.getGradePrint({
        sn:this.sn,
        sns: this.data.recommendTest.length>0?_.pluck(this.data.recommendTest, 'sn'):_.pluck(this.data.achievementArr, 'sn'),
        randomNum:this.data.recommendTest.length>0?1:2
      })
      Loger(resp.examinationRandomContents)
      this.longToast.toast()
      wxNav.redirectTo('/pages/package_preschool/evaluationprint/printpreview',{
        orderInfo:encodeURIComponent(JSON.stringify(resp.examinationRandomContents))
      })
     } catch (e) {
      this.longToast.toast()
      Loger(e)
      util.showError(e)
    }

  }),

})
