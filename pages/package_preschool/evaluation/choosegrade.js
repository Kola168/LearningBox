// pages/package_feature/evaluation/choosegrade.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

const request = util.promisify(wx.request)

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import gql from '../../../network/graphql/preschool'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    gradeList:[], // 年级数据
    gradeIndex:0,
    showGradeList:false,
  },

  onLoad: function (options) {
    this.getGradeList()
  },
  getGradeList:co.wrap(function*(e){
    try{
      let resp = yield gql.getGradeList()
      Loger(resp)
      this.setData({
        gradeList:resp.examinations
      })
    }catch(e){
      Loger(e)
      util.showError(e)
    }
  }),
  // nextHierarchy:function(e){
  //   let index=e.currentTarget.dataset.index
  //   wxNav.navigateTo('/pages/package_preschool/evaluation/secondlevel',{
  //     sn:this.data.gradeList[this.data.gradeIndex].testPaper[index].state,
  //     title:this.data.gradeList[this.data.gradeIndex].testPaper[index].title
  //   })
  // },
  showGradeList:function(){
    this.setData({
      showGradeList:!this.data.showGradeList
    })
  },
  startTest:function(e){
    let index=e.currentTarget.dataset.index
    wxNav.navigateTo('/pages/package_preschool/evaluation/test',{
      sn:this.data.gradeList[index].sn
    })
  }
})
