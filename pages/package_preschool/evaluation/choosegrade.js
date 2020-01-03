// pages/package_feature/evaluation/choosegrade.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    gradeList:[{
      name:'0-3岁',
      testPaper:[{
        image:'../images/record_voice_btn_record_stop.png',
        title:'测试标题1',
        desc:'在家上早教',
        state:'',
        children:[{name:''}]
      },{
        image:'../images/record_voice_btn_record_stop.png',
        title:'测试标题3333333333333331231241231231231231231233332',
        desc:'描述2',
        state:'80%',
        children:[],
      },{
        image:'../images/record_voice_btn_record_stop.png',
        title:'测试标题3',
        desc:'描述3',
        state:'',
        children:[],
      }]
    },{
      name:'小班',
      testPaper:[{
        image:'../images/record_voice_btn_record_stop.png',
        title:'测试标题2',
        desc:'描述2',
        state:'',
        children:[],
      }]
    }],
    gradeIndex:0,
    showGradeList:false,
  },

  onLoad: function (options) {

  },

  nextHierarchy:function(e){
    let index=e.currentTarget.dataset.index
    wxNav.navigateTo('/pages/package_preschool/evaluation/secondlevel',{
      sn:this.data.gradeList[this.data.gradeIndex].testPaper[index].state,
      title:this.data.gradeList[this.data.gradeIndex].testPaper[index].title
    })
  },
  showGradeList:function(){
    this.setData({
      showGradeList:!this.data.showGradeList
    })
  },
  startTest:function(e){
    let index=e.currentTarget.dataset.index
    wxNav.navigateTo('/pages/package_preschool/evaluation/test',{
      sn:this.data.gradeList[this.data.gradeIndex].testPaper[index].state
    })
  }
})
